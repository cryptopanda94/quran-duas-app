# Build upload files for Gemini File Search from ThaqalaynData (CC0).
# Arabic original + the project's machine English (human translations are left out: they belong to their translators).
import json, os, re, glob, sys
import sys
ROOT=(sys.argv[1] if len(sys.argv)>1 else 'thaqalayndata')+'/books'; OUT='corpus'; os.makedirs(OUT,exist_ok=True)
books=json.load(open(f'{ROOT}/books.json'))['data']['chapters']
MAXB=12*1024*1024
def txt(x):
    if isinstance(x,list): return ' '.join(t for t in x if isinstance(t,str))
    return x or ''
summary=[]
for b in books:
    slug=b['path'].split('/')[-1]
    if slug=='quran': continue
    title=b['titles'].get('en',slug); author=(b.get('author') or {}).get('en','')
    files=sorted(glob.glob(f'{ROOT}/{slug}/**/*.json',recursive=True), key=lambda p:[(0,int(x),'') if x.isdigit() else (1,0,x) for x in re.split(r'[/.]',p)])
    part=1; buf=[]; size=0; n=0
    def flush():
        global part,buf,size
        if not buf: return
        name=f'{OUT}/{slug}-{part:02d}.txt'
        open(name,'w').write(f'BOOK: {title}' + (f' — {author}' if author else '') + '\n\n' + '\n'.join(buf))
        part+=1; buf=[]; size=0
    for f in files:
        base=os.path.basename(f)
        if base.count('.')!=1 or not base[0].isdigit(): continue
        try: d=json.load(open(f))
        except Exception: continue
        if d.get('kind')!='verse_detail': continue
        v=d['data']['verse']; path=v.get('path',''); 
        if v.get('part_type')=='Heading': continue
        ai=v.get('ai') or {}
        t=v.get('text'); ar=txt(t.get('ar') if isinstance(t,dict) else t) or ' '.join(c.get('arabic_text','') for c in ai.get('chunks',[]) if isinstance(c,dict))
        ar=re.sub(r'\s+',' ',ar).strip()
        en=''
        ef=f[:-5]+'.en.json'
        if os.path.exists(ef):
            try: en=re.sub(r'\s+',' ',' '.join((json.load(open(ef)).get('ai') or {}).get('chunks',[]))).strip()
            except Exception: pass
        if not ar and not en: continue
        ref=path.replace('/books/','')
        ct=(d['data'].get('chapter_title') or {}).get('en','')
        tag=f'[{title} {ref.split(":",1)[1] if ":" in ref else ref}]'
        block=f'### {tag} {ct}\nREF: {ref}\nARABIC {tag}: {ar}\nENGLISH {tag} (machine translation): {en}\n'
        if size+len(block.encode())>MAXB: flush()
        buf.append(block); size+=len(block.encode()); n+=1
    flush()
    summary.append((slug,title,n,part-1))
    print(slug,n,'hadith',part-1,'files',flush=True)
json.dump(summary,open(f'{OUT}/_books.json','w'),ensure_ascii=False,indent=1)
