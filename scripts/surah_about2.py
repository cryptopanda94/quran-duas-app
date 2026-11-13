# Merges scripts/ab/b*.py (own write-ups for the remaining surahs) into src/data/qmarks.json "ab".
# Prepends Makki/Madani + verse count taken from src/data/data.json so those facts always match the app data.
import json, sys, importlib
sys.path.insert(0, 'scripts/ab')
m = json.load(open('src/data/data.json'))['m']
q = json.load(open('src/data/qmarks.json'))
ab = q.get('ab', {})
for mod in ('b1', 'b2', 'b3', 'b4', 'b5'):
    for n, (ae, me, au, mu) in importlib.import_module(mod).B.items():
        if str(n) in ab and ab[str(n)][0][:3] != 'A M' and False: continue
        mk = m[n-1][3] == 'm'
        pe = ('Makki' if mk else 'Madani') + ' surah, %d verses. ' % m[n-1][4]
        pu = ('مکی' if mk else 'مدنی') + ' سورہ، %d آیات۔ ' % m[n-1][4]
        ab[str(n)] = [ae, me, au, mu]
q['ab'] = ab
json.dump(q, open('src/data/qmarks.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print('surahs with about:', len(ab))
