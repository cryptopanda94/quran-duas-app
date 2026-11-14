// One-time: create a Gemini File Search store and upload the book files into it.
//   GEMINI_API_KEY=... node upload.mjs              (creates a new store, uploads ./corpus/*.txt)
//   GEMINI_API_KEY=... FILE_SEARCH_STORE=fileSearchStores/xyz node upload.mjs   (add to an existing store)
// Prints the store name at the end: put it in the service file as FILE_SEARCH_STORE.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error('Set GEMINI_API_KEY'); process.exit(1); }
const API = 'https://generativelanguage.googleapis.com';
const dir = join(dirname(fileURLToPath(import.meta.url)), 'corpus');
const H = { 'x-goog-api-key': KEY };

async function j(r) { const t = await r.text(); let d; try { d = JSON.parse(t); } catch { d = { raw: t }; } if (!r.ok) throw new Error(`${r.status} ${t.slice(0, 400)}`); return d; }

let store = process.env.FILE_SEARCH_STORE;
if (!store) {
  const d = await j(await fetch(`${API}/v1beta/fileSearchStores`, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName: 'quran-duas-books' }) }));
  store = d.name; console.log('Created store', store);
}

const files = readdirSync(dir).filter((f) => f.endsWith('.txt')).sort();
const done = new Set((await listDocs()).map((d) => d.displayName));
for (const f of files) {
  if (done.has(f)) { console.log('already uploaded', f); continue; }
  const bytes = readFileSync(join(dir, f));
  const meta = { displayName: f, mimeType: 'text/plain', chunkingConfig: { whiteSpaceConfig: { maxTokensPerChunk: 500, maxOverlapTokens: 80 } } };
  const boundary = 'qd' + Date.now();
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${boundary}\r\nContent-Type: text/plain\r\n\r\n`),
    bytes, Buffer.from(`\r\n--${boundary}--\r\n`)]);
  let op;
  for (let a = 1; a <= 4; a++) {
    try {
      op = await j(await fetch(`${API}/upload/v1beta/${store}:uploadToFileSearchStore`, { method: 'POST', headers: { ...H, 'X-Goog-Upload-Protocol': 'multipart', 'Content-Type': `multipart/related; boundary=${boundary}` }, body }));
      break;
    } catch (e) { console.log(`  retry ${a} ${f}: ${e.message.slice(0, 160)}`); await new Promise((r) => setTimeout(r, 5000 * a)); }
  }
  if (!op) { console.log('FAILED', f); continue; }
  process.stdout.write(`indexing ${f} (${(bytes.length / 1048576).toFixed(1)} MB) `);
  while (!op.done) { await new Promise((r) => setTimeout(r, 5000)); op = await j(await fetch(`${API}/v1beta/${op.name}`, { headers: H })); process.stdout.write('.'); }
  console.log(op.error ? ' ERROR ' + JSON.stringify(op.error) : ' done');
}
console.log('\nFILE_SEARCH_STORE=' + store);

async function listDocs() {
  const out = []; let page = '';
  try {
    do {
      const d = await j(await fetch(`${API}/v1beta/${store}/documents?pageSize=20${page ? '&pageToken=' + page : ''}`, { headers: H }));
      out.push(...(d.documents || [])); page = d.nextPageToken || '';
    } while (page);
  } catch (e) { /* new store */ }
  return out;
}
