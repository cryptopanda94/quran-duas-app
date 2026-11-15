// Fill in the translations that are missing, with Gemini. Run on the server, in this folder:
//   set -a; . /etc/assistant.env; set +a
//   node translate_missing.mjs --count            how many hadith lack English (costs nothing)
//   node translate_missing.mjs                    translate the missing English   -> extra-en.jsonl
//   node translate_missing.mjs --urdu --count     how many hadith lack Urdu
//   node translate_missing.mjs --urdu             translate the missing Urdu      -> extra-ur.jsonl
//   node translate_missing.mjs [--urdu] --clean   remove saved lines that are not real translations (keeps a .bak copy)
// Safe to stop and run again: it continues where it left off. Restart the assistant service to load the results.
import { readFileSync, readdirSync, existsSync, appendFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
const here = dirname(fileURLToPath(import.meta.url));
const UR = process.argv.includes('--urdu'), F = UR ? 'ur' : 'en';
const KEY = process.env.GEMINI_API_KEY, MODEL = process.env.TRANSLATE_MODEL || process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const BASE = process.env.GEMINI_BASE || 'https://generativelanguage.googleapis.com';
const OUT = join(here, `extra-${F}.jsonl`), PAR = +(process.env.PARALLEL || 4), MAXC = 6000;

// Arabic that is only a dash, a number or a stray word has nothing to translate; sending it makes the model invent text.
const MINL = 6, letters = (t) => (t.match(/[ء-يٱ-ۓ]/g) || []).length;
// A reply that asks for the text, is far longer than its source, or is in the wrong script is not a translation.
const BAD = /please provide|provide the (arabic|text|hadith)|no (arabic )?text (was|is|has been)|text (is|was) (missing|not provided|empty)|you (have not|haven't|did not|didn't) provided?|i (cannot|can't|am unable to) translate|there is no (arabic|text)|براہ کرم|متن فراہم|متن موجود نہیں|کوئی متن|ترجمہ نہیں کر سکتا/i;
const latin = (t) => (t.match(/[A-Za-z]/g) || []).length;
const ok = (ar, tr) => !!tr && !BAD.test(tr) && tr.length <= ar.length * 4 + 120 && (UR ? letters(tr) >= 3 && latin(tr) <= tr.length * 0.15 : latin(tr) >= tr.length * 0.4);

const jl = (f, gz) => { if (!existsSync(f)) return []; const b = readFileSync(f); return (gz ? gunzipSync(b) : b).toString('utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); };
// what already has this language: the corpus (English), urdu.jsonl.gz (Urdu), the file that ships with the code, and earlier runs
const have = new Set(jl(OUT).map((j) => j.r));
if (UR) { for (const j of jl(join(here, 'urdu.jsonl.gz'), true)) if (j.u) have.add(j.r); }
else { for (const j of jl(join(here, 'added-en.jsonl'))) have.add(j.r); }
const AR = new Map(), todo = []; let skipped = 0;
for (const f of readdirSync(join(here, 'corpus')).filter((x) => x.endsWith('.txt')).sort())
  for (const b of readFileSync(join(here, 'corpus', f), 'utf8').split('\n### ').slice(1)) {
    const ref = (b.match(/\nREF: (\S+)/) || [])[1], ar = ((b.match(/\nARABIC \[[^\]]+\]: (.*)/) || [])[1] || '').trim(), en = ((b.match(/\nENGLISH \[[^\]]+\] \(machine translation\): (.*)/) || [])[1] || '').trim();
    if (!ref) continue; AR.set(ref, ar);
    if (!ar || (!UR && en) || have.has(ref)) continue;
    if (letters(ar) < MINL) skipped++; else todo.push({ ref, ar });
  }

if (process.argv.includes('--clean')) {
  const lines = existsSync(OUT) ? readFileSync(OUT, 'utf8').split('\n').filter(Boolean) : [], keep = [], drop = [];
  for (const l of lines) { let j; try { j = JSON.parse(l); } catch { drop.push(l); continue; } const ar = AR.get(j.r) || ''; (letters(ar) >= MINL && ok(ar, String(j[F] || '').trim()) ? keep : drop).push(l); }
  if (drop.length) { writeFileSync(OUT + '.bak', lines.join('\n') + '\n'); writeFileSync(OUT, keep.join('\n') + (keep.length ? '\n' : '')); }
  console.log(`kept ${keep.length}, removed ${drop.length}` + (drop.length ? ` (the old file is saved as extra-${F}.jsonl.bak)` : ''));
  for (const l of drop.slice(0, 200)) { try { console.log('  removed', JSON.parse(l).r); } catch {} }
  process.exit(0);
}
const chars = todo.reduce((n, x) => n + x.ar.length, 0);
console.log(`${todo.length} hadith without ${UR ? 'Urdu' : 'English'} (${chars.toLocaleString()} Arabic characters), ${skipped} skipped (no real Arabic text), model ${MODEL}`);
if (process.argv.includes('--count') || !todo.length) process.exit(0);
if (!KEY) { console.error('GEMINI_API_KEY is not set'); process.exit(1); }

const PROMPT = UR
  ? `Translate this Arabic hadith text from a classical Shia book into clear, faithful Urdu.
- Translate everything, including the chain of narrators. Do not summarise, explain or add anything.
- Write names as they are usually written in Urdu and keep honorifics such as علیہ السلام and صلی اللہ علیہ وآلہ وسلم.
- When a Quran verse is quoted, translate it and keep any reference that is in the text.
- Reply with the Urdu translation only, in Urdu script.`
  : `Translate this Arabic hadith text from a classical Shia book into clear, faithful English.
- Translate everything, including the chain of narrators. Do not summarise, explain or add anything.
- Keep names in their usual English spelling and keep honorifics such as (peace be upon him).
- When a Quran verse is quoted, translate it and keep any reference that is in the text.
- Reply with the English translation only.`;
// split a very long text at sentence ends; never leave a tiny piece on its own
const parts = (t) => {
  if (t.length <= MAXC) return [t];
  const out = []; let cur = '';
  for (const s of t.split(/(?<=[.؟!:؛])\s+/)) { if (cur && cur.length + s.length > MAXC) { out.push(cur); cur = ''; } cur += (cur ? ' ' : '') + s; while (cur.length > MAXC * 1.5) { out.push(cur.slice(0, MAXC)); cur = cur.slice(MAXC); } }
  if (cur) out.push(cur);
  for (let i = 0; i < out.length - 1; i++) if (letters(out[i]) < 40) { out[i + 1] = out[i] + ' ' + out[i + 1]; out.splice(i, 1); i--; }
  if (out.length > 1 && letters(out[out.length - 1]) < 40) out[out.length - 2] += ' ' + out.pop();
  return out;
};
async function tr(text) {
  for (let i = 0; ; i++) {
    const r = await fetch(`${BASE}/v1beta/models/${MODEL}:generateContent`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': KEY },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: PROMPT }] }, contents: [{ role: 'user', parts: [{ text }] }], generationConfig: { temperature: 0.1 } }) }).catch((e) => ({ ok: false, status: 0, text: async () => String(e) }));
    if (r.ok) {
      const j = await r.json(), c = (j.candidates || [])[0] || {}, t = ((c.content || {}).parts || []).map((p) => p.text || '').join('').replace(/\s+/g, ' ').trim();
      if (ok(text, t) && c.finishReason !== 'MAX_TOKENS') return t;
      if (i >= 2) { console.error('rejected', c.finishReason || (j.promptFeedback || {}).blockReason || 'no text', t ? JSON.stringify(t.slice(0, 80)) : ''); return ''; }
    } else if (i >= 5 || (r.status >= 400 && r.status < 500 && r.status !== 429)) { console.error('error', r.status, (await r.text()).slice(0, 200)); return ''; }
    await new Promise((s) => setTimeout(s, 2000 * (i + 1)));
  }
}
let n = 0, fail = 0, at = 0;
await Promise.all(Array.from({ length: PAR }, async () => {
  while (at < todo.length) {
    const x = todo[at++], out = [];
    for (const p of parts(x.ar)) { const t = await tr(p); if (!t) { out.length = 0; break; } out.push(t); }
    if (out.length) { appendFileSync(OUT, JSON.stringify({ r: x.ref, [F]: out.join(' ') }) + '\n'); n++; } else fail++;
    if ((n + fail) % 50 === 0) console.log(`${n + fail}/${todo.length} (${fail} not saved)`);
  }
}));
console.log(`done: ${n} translated, ${fail} not saved (run again to retry them)`);
