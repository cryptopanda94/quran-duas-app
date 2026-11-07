# Build per-surah 16 kbps AAC files + verse timings for one reciter from everyayah.com per-ayah MP3s.
# usage: python3 build-reciter.py <everyayah_folder> <slug> <pages_dir> <out_json>
import json, os, subprocess, sys, concurrent.futures as cf, urllib.request, time, wave
folder, slug, pages, out_json = sys.argv[1:5]
meta = json.load(open(os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'data.json')))['m']
tmp = '/tmp/rec'; os.makedirs(tmp, exist_ok=True)
dst = os.path.join(pages, 'audio', slug); os.makedirs(dst, exist_ok=True)
SR = 16000; PART_MS = 45 * 60 * 1000

def get(name):
    p = f'{tmp}/{name}.mp3'
    if os.path.exists(p) and os.path.getsize(p) > 1000: return p
    url = f'https://everyayah.com/data/{folder}/{name}.mp3'
    for i in range(6):
        try:
            data = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'quran-duas-build'}), timeout=60).read()
            open(p, 'wb').write(data); return p
        except Exception as e:
            print('retry', name, e, flush=True); time.sleep(2 + i * 3)
    raise SystemExit('failed ' + name)

def wav(name):
    w = f'{tmp}/{name}.wav'
    if not os.path.exists(w):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', get(name), '-ac', '1', '-ar', str(SR), '-sample_fmt', 's16', w], check=True)
    with wave.open(w) as f: n = f.getnframes()
    return w, n

names = ['001001'] + [f'{s:03d}{a:03d}' for s in range(1, 115) for a in range(1, meta[s-1][4] + 1)]
names = list(dict.fromkeys(names))
with cf.ThreadPoolExecutor(16) as ex: list(ex.map(get, names))
print('downloaded', len(names), flush=True)
with cf.ThreadPoolExecutor(os.cpu_count() or 2) as ex: info = dict(zip(names, ex.map(wav, names)))

AUD = []
for s in range(1, 115):
    n_ay = meta[s-1][4]
    seq = [(a, f'{s:03d}{a:03d}') for a in range(1, n_ay + 1)]
    pre = [] if s in (1, 9) else ['001001']  # bismillah before every surah except Fatiha (its verse 1) and Tawba
    parts, timings, cur, cur_ms, pstart = [], [], [], 0, 0
    def flush():
        global_k = len(parts) + 1
        parts.append((list(cur), pstart))
    t = 0
    first = True
    for a, nm in seq:
        files = (pre if first else []) + [nm]; first = False
        dur = sum(info[f][1] for f in files) * 1000 // SR
        if cur and t - pstart + dur > PART_MS and a > 1:
            flush(); cur = []; pstart = t
        cur.extend(files); timings.append([t, t + dur]); t += dur
    flush()
    plist = []
    for k, (files, start) in enumerate(parts):
        fname = f'{s:03d}.mp4' if len(parts) == 1 else f'{s:03d}-{k+1}.mp4'
        lst = f'{tmp}/l{s}.txt'
        open(lst, 'w').write(''.join(f"file '{info[f][0]}'\n" for f in files))
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c:a', 'aac', '-b:a', '16k',
                        '-ac', '1', '-ar', str(SR), '-movflags', '+faststart', os.path.join(dst, fname)], check=True)
        plist.append([f'{slug}/{fname}', start])
    AUD.append({'p': plist, 'a': timings})
    print('surah', s, len(parts), 'parts', t // 1000, 's', flush=True)
json.dump(AUD, open(out_json, 'w'), separators=(',', ':'))
