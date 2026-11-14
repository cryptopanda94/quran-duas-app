// Quran & Duas assistant: a small proxy between the app and the Gemini API.
// The Gemini key stays on this server; the app only ever talks to POST /ask.
// Needs Node 18+ (built-in fetch). No npm packages.
//
//   GEMINI_API_KEY=...  node server.mjs
//
// Settings (environment variables):
//   GEMINI_API_KEY   required
//   GEMINI_MODEL     default gemini-3.1-flash-lite
//   FILE_SEARCH_STORE  the store printed by upload.mjs (fileSearchStores/...) - the books
//   PORT             default 8787 (put HTTPS in front of it, e.g. Caddy or nginx)
//   PER_MINUTE       questions per user per minute   (default 6)
//   PER_DAY          questions per user per day      (default 200)
//   DAILY_CAP        questions for everyone per day  (default 3000) - protects your bill
import http from 'node:http';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('Set GEMINI_API_KEY'); process.exit(1); }
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const STORE = process.env.FILE_SEARCH_STORE || '';
if (!STORE) console.warn('FILE_SEARCH_STORE not set: answers will not search the books');
const PORT = +(process.env.PORT || 8787);
const PER_MIN = +(process.env.PER_MINUTE || 6), PER_DAY = +(process.env.PER_DAY || 200), CAP = +(process.env.DAILY_CAP || 3000);

const here = dirname(fileURLToPath(import.meta.url));
const CAT = JSON.parse(readFileSync(join(here, 'catalog.json'), 'utf8')); // [[id, name, note], ...]
const catText = CAT.map(([id, n, s]) => `${id} | ${n}${s ? ' — ' + s : ''}`).join('\n');
const IDS = new Set(CAT.map((c) => c[0]));

// --- the books, for readable references and "View in book" (corpus/*.txt from corpus.tar.gz, titles.json) ---
const TITLES = existsSync(join(here, 'titles.json')) ? JSON.parse(readFileSync(join(here, 'titles.json'), 'utf8')) : {};
const HAD = new Map(), CHAP = new Map(), LABEL = new Map();   // ref -> hadith, chapterRef -> [ref], label -> ref
const cdir = join(here, 'corpus');
if (existsSync(cdir)) {
  for (const f of readdirSync(cdir).filter((x) => x.endsWith('.txt')).sort()) {
    for (const block of readFileSync(join(cdir, f), 'utf8').split('\n### ').slice(1)) {
      const label = (block.match(/^\[([^\]]+)\]/) || [])[1], ref = (block.match(/\nREF: (\S+)/) || [])[1];
      if (!label || !ref) continue;
      const ar = (block.match(/\nARABIC \[[^\]]+\]: (.*)/) || [])[1] || '', en = (block.match(/\nENGLISH \[[^\]]+\] \(machine translation\): (.*)/) || [])[1] || '';
      HAD.set(ref, { ref, label, ar: ar.trim(), en: en.trim() }); LABEL.set(label, ref);
      const ch = ref.slice(0, ref.lastIndexOf(':'));
      if (!CHAP.has(ch)) CHAP.set(ch, []); CHAP.get(ch).push(ref);
    }
  }
  console.log(`books loaded: ${HAD.size} hadith in ${CHAP.size} chapters`);
} else console.warn('corpus/ not found: references will be shorter and "View in book" is off');

// table of contents: parent ref -> child refs (books > volumes > chapters), and how many hadith sit under each
const KIDS = new Map(), COUNT = new Map();
for (const [ch, list] of CHAP) {
  const p = ch.split(':');
  for (let i = 1; i <= p.length; i++) {
    const node = p.slice(0, i).join(':');
    COUNT.set(node, (COUNT.get(node) || 0) + list.length);
    if (i > 1) { const par = p.slice(0, i - 1).join(':'); if (!KIDS.has(par)) KIDS.set(par, new Set()); KIDS.get(par).add(node); }
  }
}
const byNum = (a, b) => { const x = a.split(':'), y = b.split(':'); return (+x[x.length - 1] || 0) - (+y[y.length - 1] || 0); };
const kids = (ref) => [...(KIDS.get(ref) || [])].sort(byNum);

const nice = (t) => (t && t === t.toUpperCase() && /[A-Z]/.test(t) ? t.toLowerCase().replace(/(^|[\s-])([a-z])/g, (m, a, b) => a + b.toUpperCase()).replace(/\b(Of|And|The|In|On|To|From|For|With|About|A|An)\b/g, (w, x, i) => (i ? w.toLowerCase() : w)) : t || '');
// "al-kafi:1:1:1:2" -> { book, parts:[...], cite:"Al-Kafi · Volume One · The Book of Intellect and Ignorance · Chapter 1 · Hadith 2" }
function cite(ref) {
  const [slug, ...nums] = ref.split(':');
  const book = (TITLES[slug] && TITLES[slug].en) || slug;
  const parts = [];
  for (let i = 1; i < nums.length; i++) {
    const t = TITLES[slug + ':' + nums.slice(0, i).join(':')];
    parts.push(nice(t && t.en) || (i === nums.length - 1 ? 'Chapter ' + nums[i - 1] : 'Part ' + nums[i - 1]));
  }
  const last = nums[nums.length - 1];
  parts.push((slug === 'nahj-al-balagha' ? 'Section ' : 'Hadith ') + last);
  return { book, parts, cite: [book, ...parts].join(' · ') };
}

// title of a volume / book / chapter node, e.g. "al-kafi:1:1" -> {en:"The Book of Intellect and Ignorance", ar:"..."}
function nodeTitle(ref) {
  const t = TITLES[ref] || {}, p = ref.split(':');
  if (p.length === 1) return { en: t.en || ref, ar: t.ar || '' };
  return { en: nice(t.en) || (CHAP.has(ref) ? 'Chapter ' : 'Part ') + p[p.length - 1], ar: t.ar || '' };
}
function chapterItems(ch) {
  const unit = ch.split(':')[0] === 'nahj-al-balagha' ? 'Section' : 'Hadith';
  return { unit, items: (CHAP.get(ch) || []).map((r) => { const x = HAD.get(r); return { ref: r, n: r.split(':').pop(), ar: x.ar, en: x.en }; }) };
}
// one level of a book: its parts, or the hadith when the node is a chapter
function toc(ref) {
  if (!COUNT.has(ref)) return null;
  // skip levels that hold a single unnamed part
  let at = ref, ks = kids(at);
  while (ks.length === 1 && !CHAP.has(at)) { at = ks[0]; ks = kids(at); }
  const p = ref.split(':'), slug = p[0];
  const path = []; for (let i = 1; i < p.length; i++) path.push(nodeTitle(p.slice(0, i).join(':')).en);
  // where "back" goes: the nearest level above that is not skipped
  let up = p.length > 1 ? p.slice(0, -1).join(':') : '';
  while (up.includes(':') && kids(up.slice(0, up.lastIndexOf(':'))).length === 1) up = up.slice(0, up.lastIndexOf(':'));
  const out = { ref, up, book: nodeTitle(slug).en, path, title: nodeTitle(ref), count: COUNT.get(ref),
    children: ks.map((k) => ({ ref: k, title: nodeTitle(k), count: COUNT.get(k), leaf: CHAP.has(k) && !KIDS.has(k) })) };
  if (CHAP.has(at)) Object.assign(out, chapterItems(at));
  return out;
}

const SYSTEM = `You are HYDER AI, the assistant inside "Quran & Duas", a Shia (Ithna Ashari) app with the Holy Quran, duas, ziyarat, aamaal, namaz and the Sahifa Sajjadiya. The app is dedicated to Imam-e-Zamana (a.t.f.s.).

Your library
You can search a library of classical Shia hadith books (al-Kafi, Man La Yahduruhu al-Faqih, Tahdhib al-Ahkam, al-Istibsar, Nahj al-Balagha, the Amali of Saduq and Mufid, al-Khisal, al-Tawhid, Kamal al-Din, Uyun Akhbar al-Rida, Ma'ani al-Akhbar, Thawab al-A'mal, Kamil al-Ziyarat, Kitab al-Ghayba of Nu'mani and Tusi, and others). Each passage is labelled like [Al-Kafi 1:1:1:2] = book, then volume:book:chapter:hadith.
- For any question about hadith, beliefs, virtues, history or practice, search the library first and base the answer on what you find.
- Name the source of every hadith you use with its label, e.g. "(Al-Kafi 2:1:3:5)". Never cite a hadith you did not find in the library or know for certain.
- The English in the library is a machine translation; when you quote, prefer a short faithful paraphrase and say the hadith is from the Arabic original.
- If the library has nothing relevant, say so plainly instead of guessing.

How to answer
- Answer from a Shia Ithna Ashari perspective, respectfully and accurately. Use the honorifics (s.a.w.w.), (a.s.), (s.a.), (a.t.f.s.).
- Reply in the user's language: English, Urdu (Urdu script) or Roman Urdu, whichever they wrote in.
- Be concise: usually a short paragraph or a few bullet points.
- Cite where things come from: Quran as surah:verse, hadith with the book (e.g. al-Kafi, Bihar al-Anwar, Nahj al-Balagha) when you are confident. Never invent a hadith, a chain, a verse or a reference. If you are not sure, say so.
- For fiqh questions (rulings: halal/haram, how to pray, khums, fasting, etc.) give the general position if it is well known, say that details differ between maraji, and tell the user to follow their own marja's risala or office. Never issue a fatwa.
- Do not quote long Arabic passages from memory; point the user to the page in the app instead.
- Your name is HYDER AI. If asked who you are, say you are HYDER AI, the assistant of the Quran & Duas app.
- Stay on Islam, the Quran, duas, ziyarat, history of the Ahl al-Bayt (a.s.) and using this app. Politely decline anything else.

Linking to pages in the app
- To open a page in the app, write its id in double square brackets, e.g. [[dua-kumayl]]. Only use ids from the list below - never make one up.
- For the Quran write [[surah-N]] for a surah or [[surah-N-V]] for a verse, e.g. [[surah-36]] or [[surah-2-255]], and [[juz-N]] for a juz (1-30).

Pages in the app (id | name — note):
${catText}`;

// --- tiny in-memory rate limiter ---
const hits = new Map(); let dayKey = '', dayCount = 0;
function allow(ip) {
  const now = Date.now(), today = new Date().toISOString().slice(0, 10);
  if (today !== dayKey) { dayKey = today; dayCount = 0; hits.clear(); }
  if (dayCount >= CAP) return 'The assistant is busy today. Please try again tomorrow.';
  const h = hits.get(ip) || { min: [], day: 0 };
  h.min = h.min.filter((t) => now - t < 60000);
  if (h.min.length >= PER_MIN) return 'Please wait a minute before asking again.';
  if (h.day >= PER_DAY) return "You've reached today's limit. Please try again tomorrow.";
  h.min.push(now); h.day++; hits.set(ip, h); dayCount++;
  return null;
}

function send(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' });
  res.end(JSON.stringify(obj));
}

// split a retrieved chunk into hadith passages: {label, chapter, ar, en}
function passages(text) {
  const map = new Map();
  const get = (label) => { if (!map.has(label)) map.set(label, { label, chapter: '', ar: '', en: '' }); return map.get(label); };
  for (const line of String(text || '').split('\n')) {
    let m;
    if ((m = line.match(/^### \[([^\]]+)\]\s*(.*)$/))) get(m[1]).chapter = m[2].trim();
    else if ((m = line.match(/^ARABIC \[([^\]]+)\]:\s*(.*)$/))) get(m[1]).ar = m[2].trim();
    else if ((m = line.match(/^ENGLISH \[([^\]]+)\] \(machine translation\):\s*(.*)$/))) get(m[1]).en = m[2].trim();
  }
  return [...map.values()].filter((p) => p.ar || p.en);
}

async function ask(messages) {
  const contents = messages.slice(-12).map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: String(m.text || '').slice(0, 2000) }] }));
  const gen = async (system) => {
    const body = { systemInstruction: { parts: [{ text: system }] }, contents, generationConfig: { temperature: 0.3, maxOutputTokens: 1200 } };
    if (STORE) body.tools = [{ fileSearch: { fileSearchStoreNames: [STORE] } }];
    const r = await fetch(`${process.env.GEMINI_BASE || 'https://generativelanguage.googleapis.com'}/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY }, body: JSON.stringify(body), signal: AbortSignal.timeout(60000),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error((j.error && j.error.message) || 'Gemini HTTP ' + r.status);
    return j.candidates && j.candidates[0];
  };
  const found = (x) => !!(x && x.groundingMetadata && (x.groundingMetadata.groundingChunks || []).length);
  let c = await gen(SYSTEM);
  // Gemini decides for itself whether to search. If it answered from memory, ask once more and insist on the books,
  // so answers carry references that can be checked.
  if (STORE && c && !found(c)) {
    try {
      const c2 = await gen(SYSTEM + '\n\nIMPORTANT for this reply: you have not searched the library yet. Search the library with the file search tool now, before answering, and base the answer on the passages you find, citing them. Do not answer from memory. If the question is only a greeting or about using the app, answer it normally.');
      if (found(c2)) c = c2;
    } catch (e) { console.error(new Date().toISOString(), 'retry failed:', e.message); }
  }
  let text = c && c.content && c.content.parts ? c.content.parts.map((p) => p.text || '').join('') : '';
  if (!text) return { text: 'Sorry, I could not answer that. Please rephrase your question.', refs: [] };

  // references: the passages Gemini actually used, numbered [1] [2] ... and marked in the answer
  const gm = c.groundingMetadata || {};
  const chunks = (gm.groundingChunks || []).map((g) => (g.retrievedContext || {}));
  const refs = [], byLabel = new Map(), chunkNum = new Map();
  chunks.forEach((ch, ci) => {
    for (const p of passages(ch.text)) {
      if (!byLabel.has(p.label)) { byLabel.set(p.label, refs.length + 1); const ref = LABEL.get(p.label) || ''; const full = HAD.get(ref); refs.push({ n: refs.length + 1, ...p, ...(full ? { ar: full.ar || p.ar, en: full.en || p.en } : {}), ref, ...(ref ? cite(ref) : { cite: p.label }), book: !!(ref && CHAP.size) }); }
      if (!chunkNum.has(ci)) chunkNum.set(ci, byLabel.get(p.label));
    }
  });
  const sup = (gm.groundingSupports || []).filter((s) => s.segment && s.segment.text).sort((a, b) => (b.segment.endIndex || 0) - (a.segment.endIndex || 0));
  for (const s of sup) {
    const nums = [...new Set((s.groundingChunkIndices || []).map((ci) => chunkNum.get(ci)).filter(Boolean))].sort((a, b) => a - b);
    if (!nums.length) continue;
    const at = text.indexOf(s.segment.text);
    if (at < 0) continue;
    const end = at + s.segment.text.length;
    text = text.slice(0, end) + nums.map((n) => `[${n}]`).join('') + text.slice(end);
  }
  // drop links to pages that don't exist
  text = text.replace(/\[\[([a-z0-9-]+)\]\]/gi, (all, id) => (IDS.has(id) || /^(surah-\d{1,3}(-\d{1,3})?|juz-\d{1,2})$/.test(id) ? all : id));
  return { text, refs: refs.slice(0, 12) };
}

http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method === 'GET' && req.url === '/health') return send(res, 200, { ok: true, model: MODEL, hadith: HAD.size });
  if (req.method === 'GET' && req.url.startsWith('/toc?')) {
    const t = toc(new URL(req.url, 'http://x').searchParams.get('ref') || '');
    return t ? send(res, 200, t) : send(res, 404, { error: 'Not found' });
  }
  if (req.method === 'GET' && req.url.startsWith('/chapter?')) {
    const ref = new URL(req.url, 'http://x').searchParams.get('ref') || '';
    const h = HAD.get(ref); if (!h) return send(res, 404, { error: 'Not found' });
    const ch = ref.slice(0, ref.lastIndexOf(':')), list = CHAP.get(ch) || [ref];
    const c = cite(ref), t = TITLES[ch] || {};
    return send(res, 200, { ref, book: c.book, path: c.parts.slice(0, -1), title: { en: nice(t.en) || c.parts[c.parts.length - 2] || '', ar: t.ar || '' },
      items: list.map((r) => { const x = HAD.get(r); return { ref: r, n: r.split(':').pop(), ar: x.ar, en: x.en }; }) });
  }
  if (req.method !== 'POST' || req.url !== '/ask') return send(res, 404, { error: 'Not found' });
  let body = '';
  req.on('data', (d) => { body += d; if (body.length > 40000) req.destroy(); });
  req.on('end', async () => {
    try {
      const { messages } = JSON.parse(body || '{}');
      if (!Array.isArray(messages) || !messages.length || !String(messages[messages.length - 1].text || '').trim()) return send(res, 400, { error: 'Empty question' });
      const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
      const lim = allow(ip); if (lim) return send(res, 429, { error: lim });
      send(res, 200, await ask(messages));
    } catch (e) {
      console.error(new Date().toISOString(), e.message);
      send(res, 502, { error: 'The assistant is not available right now. Please try again shortly.' });
    }
  });
}).listen(PORT, '127.0.0.1', () => console.log(`assistant on 127.0.0.1:${PORT} using ${MODEL}`));
