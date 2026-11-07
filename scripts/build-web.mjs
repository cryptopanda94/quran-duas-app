// Builds www/ (the app's web layer) from src/.
// Run:  node scripts/build-web.mjs      (also run automatically by `npm run sync`)
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const www = join(root, 'www');
const rd = (p) => readFileSync(join(src, p), 'utf8');
const json = (p) => rd(p).replace(/<\//g, '<\\/');

// Full-quality recitation (Mishary Alafasy, 64 kbps, one file per surah) streamed by the app.
const AUDIO_BASE = 'https://github.com/Mohamedd-Ashraf/quran-surah-reciter-audio/releases/download/surah-reciter-ar.alafasy/';
const timings = JSON.parse(rd('data/timings.json'));
const aud = JSON.stringify(timings.map((a, i) => ({ p: [[AUDIO_BASE + String(i + 1).padStart(3, '0') + '.mp3', 0]], a })));

let t = rd('template.html');
const must = (from, to) => {
  if (!t.includes(from)) throw new Error('build-web: pattern not found: ' + from.slice(0, 80));
  t = t.replace(from, to);
};

// Native shell tweaks: safe areas, bundled fonts, bundled azan, native bridge script.
must('<meta name="viewport" content="width=device-width, initial-scale=1">',
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">');
must('url(data:font/ttf;base64,__FONT__) format("truetype")', 'url(fonts/DigitalKhattIndoPak.ttf) format("truetype")');
must('<style>\n', `<style>
@font-face{font-family:"Noto Nastaliq Urdu";src:url(fonts/NotoNastaliqUrdu.ttf) format("truetype");font-display:swap}
header.top{padding-top:env(safe-area-inset-top)}
.sheet{padding-bottom:calc(28px + env(safe-area-inset-bottom))}
.alertbar{top:calc(12px + env(safe-area-inset-top))}
html,body{overscroll-behavior:none;-webkit-tap-highlight-color:transparent}
`);
must('<script id="azdata" type="text/plain">__AZAN__</script>', '<script id="azdata" type="text/plain" data-src="azan.mp3"></script>');
must('</body>', '<script src="capacitor.js"></script>\n<script src="native.js"></script>\n</body>');

t = t
  .replace('__DATA__', json('data/data.json'))
  .replace('__TL__', json('data/translit.json'))
  .replace('__AUD__', aud)
  .replace('__DUAS__', json('data/duas.json'))
  .replace('__UDUAS__', json('data/userduas.json'))
  .replace('__CITIES__', json('data/cities.json'))
  .replace('__EVENTS__', json('data/events.json'))
  .replace('__EXTRAS__', rd('extras.js'));

for (const p of ['__DATA__', '__TL__', '__AUD__', '__DUAS__', '__UDUAS__', '__CITIES__', '__EVENTS__', '__EXTRAS__', '__FONT__', '__AZAN__'])
  if (t.includes(p)) throw new Error('build-web: placeholder left unfilled: ' + p);

rmSync(www, { recursive: true, force: true });
mkdirSync(join(www, 'fonts'), { recursive: true });
writeFileSync(join(www, 'index.html'), t);
copyFileSync(join(src, 'native.js'), join(www, 'native.js'));
// Capacitor's JS runtime (window.Capacitor.registerPlugin etc.) — without it the native layer can't start.
{
  const capJs = join(root, 'node_modules', '@capacitor', 'core', 'dist', 'capacitor.js');
  if (existsSync(capJs)) copyFileSync(capJs, join(www, 'capacitor.js'));
  else if (process.env.CI) throw new Error('@capacitor/core/dist/capacitor.js not found — run npm install');
  else { console.warn('! capacitor.js not found (run npm install) — the native layer will not start'); writeFileSync(join(www, 'capacitor.js'), '/* missing */'); }
}
copyFileSync(join(src, 'azan.mp3'), join(www, 'azan.mp3'));
for (const f of readdirSync(src)) if (/^azan_.+\.mp3$/.test(f)) copyFileSync(join(src, f), join(www, f));   // full azans
for (const f of readdirSync(join(root, 'native', 'shared'))) if (f.endsWith('.wav'))                     // iOS notification sound sources
  copyFileSync(join(root, 'native', 'shared', f), join(www, f));
for (const f of readdirSync(join(src, 'fonts'))) copyFileSync(join(src, 'fonts', f), join(www, 'fonts', f));
console.log(`www/ built (${(Buffer.byteLength(t) / 1e6).toFixed(1)} MB index.html)`);
