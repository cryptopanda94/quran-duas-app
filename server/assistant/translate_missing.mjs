// Fill in English for the hadith that have none, with Gemini. Run on the server:
//   set -a; . /etc/assistant.env; set +a; node translate_missing.mjs --count     (only counts, costs nothing)
//   set -a; . /etc/assistant.env; set +a; node translate_missing.mjs             (translates; safe to stop and run again)
// Results are appended to extra-en.jsonl ({"r": ref, "en": text}); restart the assistant service to load them.
// English only: Urdu is never generated here.
import { readFileSync, readdirSync, existsSync, appendFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const KEY = process.env.GEMINI_API_KEY, MODEL = process.env.TRANSLATE_MODEL || process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const BASE = process.env.GEMINI_BASE || 'https://generativelanguage.googleapis.com';
const OUT = join(here, 'extra-en.jsonl'), PAR = +(process.env.PARALLEL || 4), MAXC = 6000;
const refs = (f) => (existsSync(f) ? readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l).r; } catch { return ''; } }) : []);
const done = new Set([...refs(OUT), ...refs(join(here, 'added-en.jsonl'))]);   // added-en.jsonl: translations that ship with the code
const todo = [];
for (const f of readdirSync(join(here, 'corpus')).filter((x) => x.endsWith('.txt')).sort())
  for (const b of readFileSync(join(here, 'corpus', f), 'utf8').split('\n### ').slice(1)) {
    const ref = (b.match(/\nREF: (\S+)/) || [])[1], ar = ((b.match(/\nARABIC \[[^\]]+\]: (.*)/) || [])[1] || '').trim(), en = ((b.match(/\nENGLISH \[[^\]]+\] \(machine translation\): (.*)/) || [])[1] || '').trim();
    if (ref && ar && !en && !done.has(ref)) todo.push({ ref, ar });
  }
const chars = todo.reduce((n, x) => n + x.ar.length, 0);
console.log(`${todo.length} hadith without English (${chars.toLocaleString()} Arabic characters), ${done.size} already done, model ${MODEL}`);
if (process.argv.includes('--count') || !todo.length) process.exit(0);
if (!KEY) { console.error('GEMINI_API_KEY is not set'); process.exit(1); }
const PROMPT = `Translate this Arabic hadith text from a classical Shia book into clear, faithful English.
- Translate everything, including the chain of narrators. Do not summarise, explain or add anything.
- Keep names in their usual English spelling and keep honorifics such as (peace be upon him).
- When a Quran verse is quoted, translate it and keep any reference that is in the text.
- Reply with the English translation only.`;
const parts = (t) => { if (t.length <= MAXC) return [t]; const out = []; let cur = ''; for (const s of t.split(/(?<=[.؟!:؛])\s+/)) { if (cur && cur.length + s.length > MAXC) { out.push(cur); cur = ''; } cur += (cur ? ' ' : '') + s; while (cur.length > MAXC * 1.5) { out.push(cur.slice(0, MAXC)); cur = cur.slice(MAXC); } } if (cur) out.push(cur); return out; };
async function tr(text) {
  for (let i = 0; ; i++) {
    const r = await fetch(`${BASE}/v1beta/models/${MODEL}:generateContent`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': KEY },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: PROMPT }] }, contents: [{ role: 'user', parts: [{ text }] }], generationConfig: { temperature: 0.1 } }) }).catch((e) => ({ ok: false, status: 0, text: async () => String(e) }));
    if (r.ok) { const j = await r.json(), c = (j.candidates || [])[0] || {}, t = ((c.content || {}).parts || []).map((p) => p.text || '').join('').replace(/\s+/g, ' ').trim(); if (t && c.finishReason !== 'MAX_TOKENS') return t; if (i >= 2) return ''; }
    else if (i >= 5 || (r.status >= 400 && r.status < 500 && r.status !== 429)) { console.error('error', r.status, (await r.text()).slice(0, 200)); return ''; }
    await new Promise((s) => setTimeout(s, 2000 * (i + 1)));
  }
}
let n = 0, fail = 0, at = 0;
await Promise.all(Array.from({ length: PAR }, async () => {
  while (at < todo.length) {
    const x = todo[at++], out = [];
    for (const p of parts(x.ar)) { const t = await tr(p); if (!t) { out.length = 0; break; } out.push(t); }
    if (out.length) { appendFileSync(OUT, JSON.stringify({ r: x.ref, en: out.join(' ') }) + '\n'); n++; } else fail++;
    if ((n + fail) % 50 === 0) console.log(`${n + fail}/${todo.length} (${fail} failed)`);
  }
}));
console.log(`done: ${n} translated, ${fail} failed (run again to retry them)`);
