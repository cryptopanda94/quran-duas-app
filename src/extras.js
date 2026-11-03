(function(){
const {AR,EN,UR,META,esc,setHeader,store,toast,app,$,ARX,BISMX,endMark,readbar,S}=window.Q;
const DU=JSON.parse(document.getElementById('ddata').textContent);
const CI=JSON.parse(document.getElementById('cdata').textContent);
const icons={
  bell:'<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  belloff:'<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 9.5-4.9M18 11v5l1.5 2H8M10 20a2 2 0 0 0 4 0M4 4l16 16"/></svg>'
};
function noJump(){$('jumpBtn').style.display='none'}

/* ================= DUAS ================= */
const LIST=[
  {id:'ayat-kursi',name:'Ayat ul Kursi',ur:'آیت الکرسی',sub:'Al-Baqarah 2:255–257',mark:'آ'},
  {id:'ziyarat-ashura',key:'G4',sub:'Ziyarat of Imam Husain (a.s.)',mark:'ع'},
  {id:'ziyarat-waritha',user:'waritha',sub:'With Ali Akbar, Shuhada, Abbas, Imam Reza & Imam Zamana (a.s.)',mark:'و'},
  {id:'dua-e-ahad',user:'ahad',sub:'Covenant with Imam al-Mahdi (a.t.f.s.) · every morning',mark:'ع'},
  {id:'dua-tawassul',key:'E24',sub:'Recited especially on Tuesday nights',mark:'ت'},
  {id:'dua-nudba',key:'E34',sub:'Friday mornings & Eids',mark:'ن'},
  {id:'ziyarat-warith',key:'G6',sub:'Mafatih al-Jinan text, line-by-line Urdu',mark:'و'},
];
const UD=JSON.parse(document.getElementById('udata').textContent);
LIST.forEach(d=>{if(d.key){d.name=DU[d.key].name;d.ur=DU[d.key].nameUr}if(d.user){d.name=UD[d.user].name;d.ur=UD[d.user].nameUr}});
LIST.find(x=>x.id==='ziyarat-warith').name='Ziyarat Warith (Mafatih)';
function renderDuas(){
  setHeader('Duas &amp; Ziyarat',false);
  app.innerHTML=`<div class="hero"><div class="ar" style="font-family:IndoPak,serif">اَدْعِيَه وَ زِيَارَات</div><p>Shia Ithna Ashari duas &amp; ziyarat · Arabic, English &amp; Urdu</p></div>
   <div class="list" style="margin-top:14px">${LIST.map(d=>`<a class="item dua-item" href="#dua-${d.id}"><div class="num"><span>${d.mark}</span></div>
     <div class="t"><b>${esc(d.name)}</b><small>${esc(d.sub)}</small></div><div class="ar" style="font-family:'Noto Nastaliq Urdu',serif;font-size:15px;line-height:2">${d.ur}</div></a>`).join('')}</div>
   <div class="foot">Texts from Mafatih al-Jinan as published in the open-source Shia Companion app (Urdu: Mafatih-style translation).<br>Ayat ul Kursi from the Quran text in this app.</div>`;
}
const cleanMd=s=>s.replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/^##\s*/gm,'').replace(/\*\*/g,'');
function verseHTML(ar,tr,en,ur,end){
  return `<div class="dverse"><div class="v-ar">${ar}${end?` <span class="end">${end}</span>`:''}</div>
    ${tr?`<div class="v-tr">${esc(tr)}</div>`:''}${en?`<div class="v-en">${esc(en)}</div>`:''}${ur?`<div class="v-ur">${esc(ur)}</div>`:''}</div>`;
}
function renderDua(id){
  const d=LIST.find(x=>x.id===id); if(!d) return false;
  setHeader(`${esc(d.name)}`,true); noJump();
  let h=`<div class="s-head"><div class="ar" style="font-family:'Noto Nastaliq Urdu',serif;font-size:30px;line-height:2.2">${d.ur}</div><h2>${esc(d.name)}</h2><p>${esc(d.sub)}</p></div>`;
  if(d.user){
    const U=UD[d.user];h+=readbar('dua',null);
    const tlBox=t=>t?`<div class="v-tr tlbox"><b>Transliteration</b>${esc(t).replace(/\n\n/g,'<br><br>')}</div>`:'';
    let pend=U.tl0;
    U.items.forEach(it=>{
      if(it.head){h+=tlBox(pend);pend=it.tl||'';h+=`<div class="uhead">${esc(it.head)}</div>`;return}
      if(it.note){h+=`<div class="unote">${esc(it.note)}</div>`;return}
      h+=`<div class="uv"><div class="v-ar">${it.ar}</div><div class="v-en tbox">${esc(it.en)}</div>${it.ur?`<div class="v-ur tbox urbox">${esc(it.ur)}</div>`:''}</div>`;
    });
    h+=tlBox(pend);
    h+=`<div class="foot">Arabic, English &amp; transliteration: your text (Divine Pearls).${d.user==='waritha'?' Urdu (where available): Mafatih al-Jinan.':''}</div>`;
    app.innerHTML=h;return true;
  }
  if(d.id==='ayat-kursi'){
    h+=readbar('dua',false);
    h+=`<div class="bism">${BISMX()}</div>`;
    for(const v of [255,256,257]) h+=verseHTML(ARX()[1][v-1],'',EN[1][v-1],UR[1][v-1],endMark(v));
    h+=`<div class="nav-surah"><a href="#surah-2-255">Open in Quran (2:255) ›</a></div>`;
  } else {
    const D=DU[d.key], useAlt=!!D.alt, after=useAlt?D.alt.after:{}, para=useAlt&&D.alt.style==='para';
    h+=readbar('dua',D.alt?D.alt.label:null);
    if(D.merits) h+=`<details class="merits"><summary>About &amp; merits</summary><div>${esc(cleanMd(D.merits))}</div></details>`;
    if(useAlt&&D.alt.style==='own'){
      const segs=D.segs,L=D.alt.lines,noteH=s=>`<div class="note${s.h?' h':''}">${esc(s.note)}${s.ur?`<span class="nur">${esc(s.ur)}</span>`:''}</div>`;
      let ptr=0;
      L.forEach(([ar,en,sg],k)=>{
        if(sg<0){h+=verseHTML(ar,'',en,'');return}
        while(ptr<=sg){if(segs[ptr].note!=null)h+=noteH(segs[ptr]);ptr++}
        let n=k+1;while(n<L.length&&L[n][2]<0)n++;
        const last=n>=L.length||L[n][2]!==sg, S2=segs[sg]||{};
        h+=verseHTML(ar,last?S2.tr:'',en,last?S2.ur:'');
      });
      for(;ptr<segs.length;ptr++){const s2=segs[ptr];h+=s2.note!=null?noteH(s2):verseHTML(s2.ar,s2.tr,s2.en,s2.ur)}
      h+=`<div class="foot">Arabic &amp; English: Imam al-Asr Masjid (your text). Urdu, transliteration &amp; instructions: Mafatih al-Jinan.</div>`;
    } else
    h+=D.segs.map((s,i)=>s.note!=null
      ? `<div class="note${s.h?' h':''}">${esc(s.note)}${s.ur?`<span class="nur">${esc(s.ur)}</span>`:''}</div>`
      : (para?verseHTML(s.ar,s.tr,'',s.ur)+(after[i]?`<div class="v-en v-enp">${esc(after[i])}</div>`:'')
             :verseHTML(s.ar,s.tr,useAlt?(after[i]||''):s.en,s.ur))).join('');
  }
  app.innerHTML=h;
  return true;
}

/* ================= PRAYER TIMES (Jafari / Shia Ithna Ashari) ================= */
const dtr=d=>d*Math.PI/180, rtd=r=>r*180/Math.PI;
const sin=d=>Math.sin(dtr(d)),cos=d=>Math.cos(dtr(d)),tan=d=>Math.tan(dtr(d));
const asin=x=>rtd(Math.asin(x)),acos=x=>rtd(Math.acos(x)),atan2=(y,x)=>rtd(Math.atan2(y,x)),acot=x=>rtd(Math.atan(1/x));
const fix=(a,b)=>{a=a-b*Math.floor(a/b);return a<0?a+b:a};
function julian(y,m,d){if(m<=2){y-=1;m+=12}const A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5}
function sunPos(jd){const D=jd-2451545,g=fix(357.529+0.98560028*D,360),q=fix(280.459+0.98564736*D,360),
  L=fix(q+1.915*sin(g)+0.020*sin(2*g),360),e=23.439-0.00000036*D,RA=atan2(cos(e)*sin(L),cos(L))/15;
  return{decl:asin(sin(e)*sin(L)),eqt:q/15-fix(RA,24)}}
function computeDay(y,m,d,lat,lng,tz){
  const jDate=julian(y,m,d)-lng/(15*24);
  const midDay=t=>fix(12-sunPos(jDate+t).eqt,24);
  const angleTime=(ang,t,ccw)=>{const dec=sunPos(jDate+t).decl,noon=midDay(t);
    const T=acos((-sin(ang)-sin(dec)*sin(lat))/(cos(dec)*cos(lat)))/15;return noon+(ccw?-T:T)};
  const asrT=(f,t)=>{const dec=sunPos(jDate+t).decl;return angleTime(-acot(f+tan(Math.abs(lat-dec))),t)};
  let t={fajr:5,sunrise:6,dhuhr:12,asr:13,sunset:18,maghrib:18,isha:18};
  for(let i=0;i<2;i++){const p={};for(const k in t)p[k]=t[k]/24;
    t={fajr:angleTime(16,p.fajr,true),sunrise:angleTime(0.833,p.sunrise,true),dhuhr:midDay(p.dhuhr),asr:asrT(1,p.asr),
       sunset:angleTime(0.833,p.sunset),maghrib:angleTime(4,p.maghrib),isha:angleTime(14,p.isha)}}
  for(const k in t)t[k]+=tz-lng/15;
  // high-latitude safety (night-middle rule)
  const night=fix(t.sunrise-t.sunset,24);
  const adj=(v,base,portion,ccw)=>{const diff=ccw?fix(base-v,24):fix(v-base,24);return(isNaN(v)||diff>portion)?base+(ccw?-portion:portion):v};
  t.fajr=adj(t.fajr,t.sunrise,night*16/60,true);t.isha=adj(t.isha,t.sunset,night*14/60);t.maghrib=adj(t.maghrib,t.sunset,night*4/60);
  t.midnight=t.sunset+fix(t.fajr+24-t.sunset,24)/2; // Jafari midnight: sunset → fajr
  return t;
}
function tzOffset(tz,date){
  try{const f=new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'});
    const p={};f.formatToParts(date).forEach(x=>p[x.type]=x.value);
    return(Date.UTC(+p.year,p.month-1,+p.day,+p.hour%24,+p.minute,+p.second)-date.getTime())/3600000}catch(e){return -date.getTimezoneOffset()/60}
}
function localYMD(tz,date){try{const p={};new Intl.DateTimeFormat('en-US',{timeZone:tz,year:'numeric',month:'numeric',day:'numeric'}).formatToParts(date).forEach(x=>p[x.type]=x.value);return[+p.year,+p.month,+p.day]}catch(e){return[date.getFullYear(),date.getMonth()+1,date.getDate()]}}
const PR=[['fajr','Fajr','فجر',1],['sunrise','Sunrise','طلوع آفتاب',0],['dhuhr','Dhuhr','ظہر',1],['asr','Asr','عصر',1],['sunset','Sunset','غروب آفتاب',0],['maghrib','Maghrib','مغرب',1],['isha','Isha','عشاء',1],['midnight','Midnight','نصف شب',0]];
function timesFor(loc,date){ // returns {key: Date}
  const [y,m,d]=localYMD(loc.tz,date), base=Date.UTC(y,m-1,d);
  const off=tzOffset(loc.tz,new Date(base+12*3600e3));
  const t=computeDay(y,m,d,loc.lat,loc.lng,off), r={};
  for(const k in t) r[k]=new Date(base+(t[k]-off)*3600e3);
  return r;
}
const fmt=(loc,dt)=>{try{return dt.toLocaleTimeString([], {timeZone:loc.tz,hour:'numeric',minute:'2-digit'})}catch(e){return dt.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}};

let LOC=store.get('loc',null);
const ALERTS=Object.assign({fajr:true,dhuhr:true,asr:true,maghrib:true,isha:true},store.get('alerts',{}));
let armed=false,ticker=null,audioCtx=null,playing=null,fired=store.get('fired',{});
const SLOTS=[['builtin','Shia Azan','Built in · Ammal-e-Namaz recording'],['najaf','Najaf','Imam Ali (a.s.) shrine'],['karbala','Karbala','Imam Husain (a.s.) shrine'],['kazmain','Kazmain','Imam Kadhim & Imam Jawad (a.s.) shrine'],['samarra','Samarra','Askariyain (a.s.) shrine'],['mecca','Mecca','Masjid al-Haram'],['medina','Medina','Masjid an-Nabawi'],['custom','My own recording','']];
const AZ={builtin:{url:document.getElementById('azdata').dataset.src||('data:audio/mpeg;base64,'+document.getElementById('azdata').textContent.trim()),name:'Shia Azan (Ammal-e-Namaz)',fixed:true}};
let azFajr=store.get('azFajr','builtin'), azOther=store.get('azOther','builtin');
function idb(){return new Promise((res,rej)=>{try{const r=indexedDB.open('quranapp',1);r.onupgradeneeded=()=>r.result.createObjectStore('f');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}})}
async function idbPut(key,val){const db=await idb();return new Promise((res,rej)=>{const tx=db.transaction('f','readwrite');val==null?tx.objectStore('f').delete(key):tx.objectStore('f').put(val,key);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}
async function idbGet(key){try{const db=await idb();return await new Promise(res=>{const q=db.transaction('f').objectStore('f').get(key);q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null)})}catch(e){return null}}
(async()=>{
  const old=await idbGet('azan'); if(old&&!(await idbGet('azan:custom'))){try{await idbPut('azan:custom',old);await idbPut('azan',null)}catch(e){}}
  for(const [k] of SLOTS){if(k==='builtin')continue;const r=await idbGet('azan:'+k);if(r)AZ[k]={url:URL.createObjectURL(r.blob),name:r.name}}
  if(location.hash==='#prayer')renderPrayer();
})();

function chime(){ // gentle synthesized bell, repeated
  try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();}catch(e){return}
  const ctx=audioCtx, start=ctx.currentTime+0.05, nodes=[];
  [0,1.6,3.2,4.8,6.4,8.0].forEach((o,i)=>{[523.25,659.25,783.99].forEach((f,j)=>{
    const osc=ctx.createOscillator(),g=ctx.createGain();osc.type='sine';osc.frequency.value=f*(i%2?0.75:1);
    const t0=start+o+j*0.12;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(0.18,t0+0.03);g.gain.exponentialRampToValueAtTime(0.0008,t0+1.5);
    osc.connect(g).connect(ctx.destination);osc.start(t0);osc.stop(t0+1.6);nodes.push(osc)})});
  return{stop(){nodes.forEach(n=>{try{n.stop()}catch(e){}})}};
}
function slotFor(k){const v=k==='fajr'?azFajr:azOther;return AZ[v]?v:'chime'}
function playAlert(name,k){
  stopAlert();const slot=k&&k.startsWith('slot:')?k.slice(5):slotFor(k);
  $('alertTxt').textContent=k&&k.startsWith('slot:')?`Playing: ${name}`:`It's time for ${name} prayer · ${LOC?LOC.name:''}`;$('alertbar').classList.add('show');
  if(AZ[slot]){const a=new Audio(AZ[slot].url);a.play().catch(()=>{});a.onended=()=>$('alertbar').classList.remove('show');playing={stop(){a.pause()}}}
  else playing=chime();
  try{if(window.Notification&&Notification.permission==='granted')new Notification(`${name} — time for prayer`,{body:LOC?LOC.name:''})}catch(e){}
}
function stopAlert(){if(playing){playing.stop();playing=null}$('alertbar').classList.remove('show')}
$('alertStop').onclick=stopAlert;

function tick(){
  if(!LOC)return;const now=new Date(),T=timesFor(LOC,now);
  for(const [k,n,,main] of PR){ if(!main||!ALERTS[k])continue;
    const t=T[k],id=k+'@'+t.toISOString().slice(0,16);
    if(now>=t&&now-t<120000&&!fired[id]){fired[id]=1;
      const keep={};Object.keys(fired).slice(-20).forEach(x=>keep[x]=1);fired=keep;store.set('fired',fired);
      if(armed)playAlert(n,k)}}
  if(location.hash==='#prayer')updateNext();
}
function nextPrayer(){
  const now=new Date();
  for(const dayAdd of [0,1]){const T=timesFor(LOC,new Date(now.getTime()+dayAdd*86400e3));
    for(const [k,n,u,main] of PR) if(main&&T[k]>now) return{k,n,u,t:T[k]}}
}
function updateNext(){
  const el=$('nextBox');if(!el||!LOC)return;const np=nextPrayer();if(!np)return;
  const s=Math.max(0,Math.round((np.t-new Date())/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60),sec=s%60;
  el.innerHTML=`<small>Next prayer</small><div class="nm">${np.n} · ${fmt(LOC,np.t)}</div><div class="cd">in ${h?h+'h ':''}${m}m ${String(sec).padStart(2,'0')}s</div>`;
}
function cityPicker(target){
  target.innerHTML=`<input class="inp" id="cq" placeholder="Search your city (e.g. Chicago, Karachi, Qom)" autocomplete="off">
    <div class="cities" id="cres"></div>
    <details style="margin-top:12px"><summary class="hint" style="cursor:pointer">Or enter coordinates</summary>
      <div style="display:flex;gap:8px;margin-top:8px"><input class="inp" id="clat" placeholder="Latitude" inputmode="decimal"><input class="inp" id="clng" placeholder="Longitude" inputmode="decimal"></div>
      <button class="btn pri" id="cset" style="margin-top:8px">Use these (with my phone's time zone)</button></details>`;
  const show=q=>{q=q.trim().toLowerCase();const out=[];
    if(q.length>=2){for(const p of CI.p)if(p[0].toLowerCase()===q)out.push(p);for(const p of CI.p){if(out.length>=40)break;if(out.includes(p))continue;if(p[0].toLowerCase().startsWith(q)||(q.length>3&&p[0].toLowerCase().includes(q)))out.push(p)}}
    $('cres').innerHTML=out.map((p,i)=>`<button data-i="${CI.p.indexOf(p)}">${esc(p[0])} <small>· ${esc(CI.c[p[1]]||p[1])}</small></button>`).join('')||(q.length>=2?'<div class="hint" style="padding:10px 4px">No match — try a nearby larger city, or enter coordinates.</div>':'')};
  $('cq').oninput=e=>show(e.target.value);
  $('cres').onclick=e=>{const b=e.target.closest('button');if(!b)return;const p=CI.p[+b.dataset.i];
    setLoc({name:`${p[0]}, ${CI.c[p[1]]||p[1]}`,lat:p[2],lng:p[3],tz:CI.z[p[4]]})};
  $('cset').onclick=()=>{const la=parseFloat($('clat').value),ln=parseFloat($('clng').value);
    if(!(la>=-90&&la<=90&&ln>=-180&&ln<=180)){toast('Enter a valid latitude and longitude');return}
    let tz;try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone}catch(e){tz='UTC'}
    setLoc({name:`${la.toFixed(2)}, ${ln.toFixed(2)}`,lat:la,lng:ln,tz})};
  setTimeout(()=>{try{$('cq').focus()}catch(e){}},50);
}
function setLoc(l){LOC=l;store.set('loc',l);toast('Location set: '+l.name);window.NH&&NH.refresh();route2()}
function route2(){if(location.hash==='#qibla')renderQibla();else renderPrayer()}
let editing=false;
function renderPrayer(){
  setHeader('Prayer times',false);
  if(!LOC||editing){
    app.innerHTML=`<div class="hero"><div class="ar" style="font-family:IndoPak,serif">اَوْقَاتُ الصَّلٰوة</div><p>Choose your city to see prayer times</p></div><div class="card" id="pick"></div>
    ${LOC?'<button class="btn" id="cancelEdit">Cancel</button>':''}`;
    cityPicker($('pick'));if($('cancelEdit'))$('cancelEdit').onclick=()=>{editing=false;renderPrayer()};return;
  }
  const now=new Date(),T=timesFor(LOC,now),np=nextPrayer();
  let dstr='';try{dstr=now.toLocaleDateString([], {timeZone:LOC.tz,weekday:'long',day:'numeric',month:'long'})}catch(e){}
  app.innerHTML=`
   <div class="card loc" style="margin-top:16px"><b>📍 ${esc(LOC.name)}<br><small class="hint">${esc(dstr)}</small></b><button class="btn" id="chg">Change</button></div>
   <div class="next" id="nextBox"></div>
   <div class="card ptable">${PR.map(([k,n,u,main])=>`<div class="pr${main?'':' minor'}${np&&np.k===k?' now':''}"><span>${n}</span><span class="ur">${u}</span><b>${fmt(LOC,T[k])}</b>
      ${main?`<button class="bell${ALERTS[k]?' on':''}" data-k="${k}" aria-label="Azan alert for ${n}">${ALERTS[k]?icons.bell:icons.belloff}</button>`:'<span style="width:34px;flex:none"></span>'}</div>`).join('')}</div>
   <div class="card">
     <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><b style="flex:1">Azan alerts</b>
       <button class="btn${(window.NH?NH.alertsOn():armed)?'':' pri'}" id="arm">${(window.NH?NH.alertsOn():armed)?'✓ Alerts on':'Turn on alerts'}</button></div>
     ${window.NH?`<div class="hint">The azan notification rings at each prayer time even when the app is closed or the phone is locked (a short azan, as phones limit notification sounds). Tap the notification to hear the full azan you chose below.</div>`:''}<div class="hint"${window.NH?' hidden':''}>Alerts ring <b>only while this page is open</b> on your screen — keep it open (e.g. on a charging phone or a computer). Browsers don't let web pages ring in the background, so for alerts with the phone locked you'd need an installed app.</div>
   </div>
   <div class="card">
     <b>Azan library</b>
     <div class="hint" style="margin:6px 0 4px">Add a recording for each place once. It's saved on this phone/browser only. Then choose which azan plays below.</div>
     ${SLOTS.map(([k,n,sub])=>`<div class="pr" style="display:flex;align-items:center;gap:8px;padding:11px 0;border-bottom:1px solid var(--line)">
        <div style="flex:1;min-width:0"><b style="font-size:15px">${n}</b>${sub?`<small class="hint" style="display:block">${sub}</small>`:''}
          <small style="display:block;color:${AZ[k]?'var(--accent)':'var(--muted)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${AZ[k]?'✓ '+esc(AZ[k].name):'Not added yet'}</small></div>
        ${AZ[k]?`<button class="btn" data-play="${k}">▶</button>`:''}${AZ[k]&&!AZ[k].fixed?`<button class="btn" data-del="${k}" aria-label="Remove">✕</button>`:''}
        ${k==='builtin'?'':`<label class="btn${AZ[k]?'':' pri'}" style="cursor:pointer">${AZ[k]?'Replace':'Add'}<input type="file" accept="audio/*" data-add="${k}" hidden></label>`}</div>`).join('')}
     <div style="display:flex;flex-direction:column;gap:10px;margin-top:14px">
       <label style="display:flex;align-items:center;gap:10px;font-size:14px"><span style="width:110px">Fajr azan</span><select class="inp" id="azF" style="padding:9px">${['chime',...SLOTS.map(x=>x[0])].map(v=>`<option value="${v}"${azFajr===v?' selected':''}${v!=='chime'&&!AZ[v]?' disabled':''}>${v==='chime'?'Gentle chime':SLOTS.find(x=>x[0]===v)[1]+(AZ[v]?'':' (add a recording first)')}</option>`).join('')}</select></label>
       <label style="display:flex;align-items:center;gap:10px;font-size:14px"><span style="width:110px">Other prayers</span><select class="inp" id="azO" style="padding:9px">${['chime',...SLOTS.map(x=>x[0])].map(v=>`<option value="${v}"${azOther===v?' selected':''}${v!=='chime'&&!AZ[v]?' disabled':''}>${v==='chime'?'Gentle chime':SLOTS.find(x=>x[0]===v)[1]+(AZ[v]?'':' (add a recording first)')}</option>`).join('')}</select></label>
     </div>
     <div class="hint" style="margin-top:10px">Note: the Haram in Mecca and Masjid an-Nabawi in Medina call the Sunni adhan (without “Ash-hadu anna Aliyyan Waliyyullah” and “Hayya ʿala khayr al-ʿamal”). The Mecca and Medina slots are there in case you want those recordings.</div>
   </div>
   <div class="foot">Method: Shia Ithna Ashari (Jafari, Leva Institute Qum) — Fajr 16°, Maghrib 4°, Isha 14°, midnight = halfway from sunset to Fajr.<br>Times may differ by a few minutes from your local mosque's timetable.</div>`;
  updateNext();
  $('chg').onclick=()=>{editing=true;renderPrayer()};
  app.querySelectorAll('.bell').forEach(b=>b.onclick=()=>{const k=b.dataset.k;ALERTS[k]=!ALERTS[k];store.set('alerts',ALERTS);window.NH&&NH.refresh();renderPrayer()});
  if(window.NH)$('arm').onclick=async()=>{await NH.toggleAlerts();renderPrayer()};
  else $('arm').onclick=()=>{
    if(armed){armed=false;renderPrayer();return}
    try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume()}catch(e){}
    const u=AZ[slotFor('dhuhr')]||AZ[slotFor('fajr')];if(u){const a=new Audio(u.url);a.volume=0;a.play().then(()=>a.pause()).catch(()=>{})}
    try{if(window.Notification&&Notification.permission==='default')Notification.requestPermission().catch(()=>{})}catch(e){}
    armed=true;toast('Azan alerts on — keep this page open');renderPrayer()};
  app.querySelectorAll('[data-add]').forEach(inp=>inp.onchange=async e=>{const f=e.target.files[0];if(!f)return;const k=inp.dataset.add;
    if(AZ[k])URL.revokeObjectURL(AZ[k].url);AZ[k]={url:URL.createObjectURL(f),name:f.name};
    try{await idbPut('azan:'+k,{blob:f,name:f.name})}catch(err){toast('Saved for this visit only')}renderPrayer()});
  app.querySelectorAll('[data-play]').forEach(b=>b.onclick=()=>playAlert(SLOTS.find(x=>x[0]===b.dataset.play)[1]+' azan','slot:'+b.dataset.play));
  app.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{const k=b.dataset.del;stopAlert();if(AZ[k])URL.revokeObjectURL(AZ[k].url);delete AZ[k];
    if(azFajr===k){azFajr='builtin';store.set('azFajr','builtin')}if(azOther===k){azOther='builtin';store.set('azOther','builtin')}
    try{await idbPut('azan:'+k,null)}catch(e){}renderPrayer()});
  $('azF').onchange=e=>{azFajr=e.target.value;store.set('azFajr',azFajr)};
  $('azO').onchange=e=>{azOther=e.target.value;store.set('azOther',azOther)};
}

/* ================= QIBLA ================= */
const KAABA=[21.422487,39.826206];
function qibla(lat,lng){const [kl,kg]=KAABA;const dl=dtr(kg-lng);
  return fix(rtd(Math.atan2(Math.sin(dl),Math.cos(dtr(lat))*Math.tan(dtr(kl))-Math.sin(dtr(lat))*Math.cos(dl))),360)}
function distKm(lat,lng){const [kl,kg]=KAABA,R=6371,a=Math.sin(dtr(kl-lat)/2)**2+Math.cos(dtr(lat))*Math.cos(dtr(kl))*Math.sin(dtr(kg-lng)/2)**2;return 2*R*Math.asin(Math.sqrt(a))}
function renderQibla(){
  setHeader('Qibla direction',false);
  if(!LOC||editing){app.innerHTML=`<div class="hero"><div class="ar" style="font-family:IndoPak,serif">قِبْلَه</div><p>Choose your city to find the Qibla</p></div><div class="card" id="pick"></div>${LOC?'<button class="btn" id="cancelEdit">Cancel</button>':''}`;
    cityPicker($('pick'));if($('cancelEdit'))$('cancelEdit').onclick=()=>{editing=false;renderQibla()};return}
  const b=qibla(LOC.lat,LOC.lng),km=distKm(LOC.lat,LOC.lng);
  const card=['N','NE','E','SE','S','SW','W','NW'][Math.round(b/45)%8];
  const ticks=Array.from({length:72},(_,i)=>{const a=i*5,l=i%18===0?14:i%2===0?8:4;return`<line x1="150" y1="${22}" x2="150" y2="${22+l}" transform="rotate(${a} 150 150)" stroke="var(--muted)" stroke-width="${i%18===0?2:1}"/>`}).join('');
  app.innerHTML=`
   <div class="card loc" style="margin-top:16px"><b>📍 ${esc(LOC.name)}</b><button class="btn" id="chg">Change</button></div>
   <div class="card" style="text-align:center">
     <svg class="dial" viewBox="0 0 300 300">
       <g id="roseAll" style="transition:transform .25s linear;transform-origin:150px 150px">
       <circle cx="150" cy="150" r="134" fill="var(--bg)" stroke="var(--line)" stroke-width="2"/>${ticks}
       ${['N','E','S','W'].map((t,i)=>`<text x="150" y="58" text-anchor="middle" font-size="18" font-weight="600" fill="${t==='N'?'#c0392b':'var(--muted)'}" transform="rotate(${i*90} 150 150)" font-family="Inter,sans-serif">${t}</text>`).join('')}
       <g transform="rotate(${b.toFixed(1)} 150 150)">
         <line x1="150" y1="150" x2="150" y2="62" stroke="var(--accent)" stroke-width="5" stroke-linecap="round"/>
         <path d="M150 44 L162 70 L138 70 Z" fill="var(--accent)"/>
         <g transform="translate(150 30) rotate(${(-b).toFixed(1)})"><rect x="-11" y="-11" width="22" height="22" rx="2" fill="#1d1d1d"/><rect x="-11" y="-5" width="22" height="3.5" fill="#d4b06a"/></g>
       </g>
       </g>
       <circle cx="150" cy="150" r="7" fill="var(--accent)"/>
       ${window.NH?'<path d="M150 4 L158 18 L142 18 Z" fill="var(--ink)"/>':''}
     </svg>
     <div class="qdeg">${b.toFixed(1)}° <span style="font-size:20px;color:var(--muted)">${card}</span></div>
     <div class="hint">clockwise from true North · Makkah is ${Math.round(km).toLocaleString()} km away</div>
   </div>
   ${window.NH?`<div class="card" style="text-align:center"><div id="qStatus" class="hint" style="font-size:15px">Hold your phone flat, then tap Start.</div><button class="btn pri" id="qStart" style="margin-top:10px">Start live compass</button></div>`:`<div class="card hint"><b style="color:var(--ink)">How to use it:</b> open your phone's Compass app, turn until it reads <b>${Math.round(b)}°</b> — you're then facing the Qibla. (A web page can't read your phone's compass sensor, so this dial doesn't turn by itself.)</div>`}`;
  if(window.NH)$('qStart').onclick=()=>NH.startCompass(b);
  $('chg').onclick=()=>{editing=true;renderQibla()};
}

/* ================= routing hook ================= */
/* ================= SHIA CALENDAR ================= */
const EVT=JSON.parse(document.getElementById('evdata').textContent); // [ 'MM-DD', color(1 joy,0 grief,2 other), en, urTitle, urContent ]
const HM=['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Awwal','Jumada al-Thani','Rajab','Shaban','Ramadan','Shawwal','Dhul Qadah','Dhul Hijjah'];
const HMU=['محرم','صفر','ربیع الاول','ربیع الثانی','جمادی الاول','جمادی الثانی','رجب','شعبان','رمضان','شوال','ذوالقعدہ','ذوالحجہ'];
let hAdj=store.get('hAdj',0);
const HFMT=(()=>{for(const c of ['islamic-umalqura','islamic-civil','islamic']){try{const f=new Intl.DateTimeFormat('en-u-ca-'+c,{day:'numeric',month:'numeric',year:'numeric',timeZone:'UTC'});
  const p=f.formatToParts(new Date(Date.UTC(2026,10,3)));if(p.find(x=>x.type==='month'))return f}catch(e){}}return null})();
function hijri(y,m,d){ // civil date -> {d,m,y}
  if(!HFMT)return null;const dt=new Date(Date.UTC(y,m-1,d+hAdj));const p={};
  HFMT.formatToParts(dt).forEach(x=>p[x.type]=x.value);
  return{d:parseInt(p.day),m:parseInt(p.month),y:parseInt((p.year||p.relatedYear||'0').replace(/\D/g,''))}}
const civ=dt=>[dt.getFullYear(),dt.getMonth()+1,dt.getDate()];
function hijriToday(){const [y,m,d]=civ(new Date());return hijri(y,m,d)}
const evKey=h=>String(h.m).padStart(2,'0')+'-'+String(h.d).padStart(2,'0');
function eventsOn(h){return EVT.filter(e=>e[0]===evKey(h))}
const evTitle=e=>e[2].split('\n')[0];
function hijriStr(h){return h?`${h.d} ${HM[h.m-1]} ${h.y} AH`:''}
function upcoming(n,days){const out=[];const t=new Date();
  for(let i=0;i<days&&out.length<n;i++){const dt=new Date(t.getFullYear(),t.getMonth(),t.getDate()+i);const h=hijri(...civ(dt));if(!h)break;
    eventsOn(h).forEach(e=>out.push({dt,h,e,i}))}return out.slice(0,n)}
let calStart=null,calSel=null;
function monthStart(dt){ // civil Date of the 1st of the hijri month containing dt
  let d=new Date(dt.getFullYear(),dt.getMonth(),dt.getDate());
  for(let i=0;i<31;i++){const h=hijri(...civ(d));if(h.d===1)return d;d=new Date(d.getFullYear(),d.getMonth(),d.getDate()-1)}return d}
function renderCalendar(){
  setHeader('Shia calendar',true);noJump();
  if(!HFMT){app.innerHTML='<div class="empty">This browser cannot show Islamic dates.</div>';return}
  if(!calStart)calStart=monthStart(new Date());
  const h0=hijri(...civ(calStart)),days=[];let d=new Date(calStart);
  for(let i=0;i<31;i++){const h=hijri(...civ(d));if(h.m!==h0.m)break;days.push({dt:new Date(d),h});d=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1)}
  const today=civ(new Date()).join('-'),lead=calStart.getDay();
  const g0=days[0].dt,g1=days[days.length-1].dt;
  const gm=g0.getMonth()===g1.getMonth()?g0.toLocaleDateString([], {month:'long',year:'numeric'}):`${g0.toLocaleDateString([], {month:'short'})} – ${g1.toLocaleDateString([], {month:'short',year:'numeric'})}`;
  const cells=Array(lead).fill('<div></div>').concat(days.map(x=>{const ev=eventsOn(x.h),k=civ(x.dt).join('-');
    const cls=ev.length?(ev.some(e=>e[1]===0)?' grief':ev.some(e=>e[1]===1)?' joy':' other'):'';
    return `<button class="cday${cls}${k===today?' today':''}${calSel===k?' sel':''}" data-cd="${k}"><b>${x.h.d}</b><small>${x.dt.getDate()}</small>${ev.length?'<i></i>':''}</button>`}));
  const sel=calSel?days.find(x=>civ(x.dt).join('-')===calSel):null;
  const evHTML=x=>eventsOn(x.h).map(e=>`<div class="ev ${e[1]===1?'joy':e[1]===0?'grief':'other'}"><div class="evd">${x.h.d} ${HM[x.h.m-1]} · ${x.dt.toLocaleDateString([], {weekday:'short',day:'numeric',month:'short'})}</div>
      <div class="evt">${esc(e[2]).replace(/\n+/g,'<br>')}</div>${e[4]?`<div class="evu">${esc(e[4]).replace(/\n+/g,'<br>')}</div>`:''}</div>`).join('');
  app.innerHTML=`
   <div class="calhead"><button class="btn" id="cPrev" aria-label="Previous month">‹</button>
     <div style="flex:1;text-align:center"><b style="font-size:19px">${HM[h0.m-1]} ${h0.y}</b><div style="font-family:'Noto Nastaliq Urdu',serif;color:var(--accent);line-height:2">${HMU[h0.m-1]} ${h0.y}ھ</div><small class="hint">${gm}</small></div>
     <button class="btn" id="cNext" aria-label="Next month">›</button></div>
   <div class="calgrid">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(w=>`<div class="wd">${w}</div>`).join('')}${cells.join('')}</div>
   <div class="legend"><span><i class="joy"></i>Birth / Eid</span><span><i class="grief"></i>Martyrdom / mourning</span><span><i class="other"></i>Other</span></div>
   ${sel?`<div class="card">${eventsOn(sel.h).length?evHTML(sel):`<div class="hint">${sel.h.d} ${HM[sel.h.m-1]} · no listed occasion</div>`}</div>`:''}
   <div class="tlabel" style="margin:16px 4px 6px">Occasions this month</div>
   ${days.filter(x=>eventsOn(x.h).length).map(evHTML).join('')||'<div class="hint">No listed occasions this month.</div>'}
   <div class="card" style="margin-top:16px"><b>Moon-sighting adjustment</b>
     <div class="hint" style="margin:4px 0 10px">Islamic months start with the sighting of the new moon, so your local Shia centre may be a day ahead of or behind this calendar. Adjust it to match.</div>
     <div class="sizer"><button id="hM">−1</button><div style="flex:1;text-align:center;font-weight:600">${hAdj>0?'+':''}${hAdj} day${Math.abs(hAdj)===1?'':'s'} · today is ${hijriStr(hijriToday())}</div><button id="hP">+1</button></div></div>
   <div class="foot">Occasions from the open-source Shia Companion app. Some dates have more than one narration and appear on each.</div>`;
  $('cPrev').onclick=()=>{calStart=monthStart(new Date(calStart.getFullYear(),calStart.getMonth(),calStart.getDate()-1));calSel=null;renderCalendar()};
  $('cNext').onclick=()=>{calStart=monthStart(new Date(calStart.getFullYear(),calStart.getMonth(),calStart.getDate()+32));calSel=null;renderCalendar()};
  app.querySelectorAll('[data-cd]').forEach(b=>b.onclick=()=>{calSel=calSel===b.dataset.cd?null:b.dataset.cd;renderCalendar()});
  const setAdj=v=>{hAdj=Math.max(-2,Math.min(2,v));store.set('hAdj',hAdj);calStart=null;renderCalendar()};
  $('hM').onclick=()=>setAdj(hAdj-1);$('hP').onclick=()=>setAdj(hAdj+1);
}

/* ================= TODAY / AYAH OF THE DAY ================= */
// Hand-picked verses (surah, first verse, last verse) – shown one per day, same for everyone on a given date.
const DAILY=[[94,5,6],[13,28,28],[2,286,286],[2,153,153],[65,3,3],[39,53,53],[2,186,186],[3,139,139],[9,40,40],[20,114,114],
 [29,69,69],[40,60,60],[2,152,152],[93,3,5],[21,87,87],[3,173,173],[8,46,46],[14,7,7],[17,24,24],[25,63,63],
 [49,13,13],[3,8,8],[2,201,201],[6,162,162],[33,56,56],[42,23,23],[5,55,55],[33,33,33],[76,8,9],[13,11,11],
 [16,128,128],[39,10,10],[31,17,17],[7,56,56],[2,45,46],[3,103,103],[64,11,11],[65,2,2],[50,16,16],[57,4,4],
 [2,115,115],[12,87,87],[15,99,99],[20,25,28],[3,190,191],[2,255,255],[24,35,35],[59,22,22],[112,1,4],[55,13,13],
 [11,6,6],[28,88,88],[16,97,97],[3,92,92],[2,177,177],[4,36,36],[18,10,10],[27,62,62],[35,15,15],[89,27,30]];
function dayIndex(){const d=new Date();return Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()))/864e5)}
function ayahOfDay(){const [s,a,b]=DAILY[dayIndex()%DAILY.length];return{s,a,b}}
const WEEK_DUAS={2:['dua-tawassul'],4:['ziyarat-warith'],5:['dua-nudba']};
function renderToday(){
  setHeader('Today',false);
  const now=new Date();let dstr='';try{dstr=now.toLocaleDateString([], {weekday:'long',day:'numeric',month:'long'})}catch(e){}
  const A=ayahOfDay(),ref=A.a===A.b?`${A.s}:${A.a}`:`${A.s}:${A.a}–${A.b}`;
  const vs=[];for(let v=A.a;v<=A.b;v++)vs.push(v);
  const ar=vs.map(v=>`${Q.ARX()[A.s-1][v-1]} <span class="end">${Q.endMark(v)}</span>`).join(' ');
  const en=vs.map(v=>EN[A.s-1][v-1]).join(' '),ur=vs.map(v=>UR[A.s-1][v-1]).join(' ');
  let pr='';
  if(LOC){const T=timesFor(LOC,now),np=nextPrayer();
    pr=`<a class="tcard prayer-card" href="#prayer"><div class="tlabel">${esc(LOC.name)}</div>
      <div class="tbig">${np?np.n:''} <span>${np?fmt(LOC,np.t):''}</span></div><div class="tsub" id="todayCd"></div>
      <div class="prow">${PR.filter(p=>p[3]).map(([k,n])=>`<div class="pc${np&&np.k===k?' nx':''}"><small>${n}</small><b>${fmt(LOC,T[k])}</b></div>`).join('')}</div></a>`;
  } else pr=`<a class="tcard" href="#prayer"><div class="tlabel">Prayer times</div><div class="tsub">Choose your city to see today's prayer times and azan alerts ›</div></a>`;
  const last=Q.S.last;
  const dow=now.getDay(), todays=['dua-e-ahad',...(WEEK_DUAS[dow]||[]),'ziyarat-ashura','ziyarat-waritha'];
  const ht=HFMT?hijriToday():null, tev=ht?eventsOn(ht):[], up=HFMT?upcoming(4,60).filter(x=>x.i>0).slice(0,3):[];
  app.innerHTML=`<div class="hero" style="padding-top:18px"><p style="font-size:13px;letter-spacing:.08em;text-transform:uppercase">${esc(dstr)}</p>
     ${ht?`<a href="#calendar" style="display:block;margin-top:4px"><b style="font-size:17px;color:var(--accent)">${hijriStr(ht)}</b> <span style="font-family:'Noto Nastaliq Urdu',serif;color:var(--muted)">${ht.d} ${HMU[ht.m-1]}</span></a>`:''}</div>
   ${tev.map(e=>`<a class="ev ${e[1]===1?'joy':e[1]===0?'grief':'other'}" href="#calendar" style="display:block"><div class="evd">Today</div><div class="evt">${esc(e[2]).replace(/\n+/g,'<br>')}</div></a>`).join('')}
   ${pr}
   <div class="tcard ayah-card">
     <div class="tlabel">Ayah of the day · ${esc(META[A.s-1][1])} ${ref}</div>
     <div class="v-ar" style="text-align:center;margin:8px 0 10px">${ar}</div>
     <div class="v-en" style="text-align:center">${esc(en)}</div>
     <div class="v-ur" style="text-align:center;margin-top:6px">${esc(ur)}</div>
     <div class="tact"><button class="listen" id="ayPlay">${Q.icon?'':''}▶ Listen</button><a class="btn" href="#surah-${A.s}-${A.a}">Open in Quran</a><button class="btn" id="ayCopy">Copy</button></div>
   </div>
   ${last?`<a class="continue" href="#surah-${last.s}-${last.v}"><div style="flex:1"><small>Continue reading</small><b>${esc(META[last.s-1][1])} · Verse ${last.v}</b></div>›</a>`:''}
   ${up.length?`<a class="tcard" href="#calendar"><div class="tlabel" style="display:flex">Coming up<span style="margin-left:auto;text-transform:none;letter-spacing:0">Calendar ›</span></div>
     ${up.map(x=>`<div class="upr"><i class="${x.e[1]===1?'joy':x.e[1]===0?'grief':'other'}"></i><div style="flex:1"><b>${esc(evTitle(x.e))}</b><small>${x.h.d} ${HM[x.h.m-1]} · ${x.dt.toLocaleDateString([], {weekday:'short',day:'numeric',month:'short'})} · in ${x.i} day${x.i===1?'':'s'}</small></div></div>`).join('')}</a>`:''}
   <div class="tlabel" style="margin:18px 4px 8px">For today</div>
   <div class="list">${todays.map(id=>{const d=LIST.find(x=>x.id===id);return d?`<a class="item dua-item" href="#dua-${d.id}"><div class="num"><span>${d.mark}</span></div><div class="t"><b>${esc(d.name)}</b><small>${esc(d.sub)}</small></div></a>`:''}).join('')}</div>
   ${window.NH?`<div class="card hint" style="margin-top:16px"><b style="color:var(--ink)">Widgets:</b> add the Next Prayer and Ayah of the Day widgets to your home or lock screen — touch and hold an empty spot, tap <b>+</b> (iPhone) or <b>Widgets</b> (Android), and search “Quran & Duas”.</div>`:`<div class="card hint" style="margin-top:16px"><b style="color:var(--ink)">Widgets:</b> lock-screen and home-screen widgets need an app installed from the App Store, so this web app can't add one. This Today page shows the same things — next prayer and the ayah of the day.</div>`}`;
  $('ayPlay').onclick=()=>{Q.playVerse(A.s,A.a)};
  $('ayCopy').onclick=()=>{const t=`${vs.map(v=>Q.ARX()[A.s-1][v-1]).join(' ')}\n\n${en}\n\n${ur}\n— Quran ${ref} (${META[A.s-1][1]})`;
    try{navigator.clipboard.writeText(t).then(()=>toast('Ayah copied'),()=>toast('Copy not allowed here'))}catch(e){toast('Copy not allowed here')}};
  updToday();
}
function updToday(){const el=$('todayCd');if(!el||!LOC)return;const np=nextPrayer();if(!np)return;
  const s=Math.max(0,Math.round((np.t-new Date())/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60);
  el.textContent=`Next prayer in ${h?h+' hr ':''}${m} min`}
setInterval(()=>{if(location.hash===''||location.hash==='#today')updToday()},20000);

window.XR=function(h){
  if(h===''||h==='today'){renderToday();return true}
  if(h==='calendar'){renderCalendar();return true}
  if(h!=='prayer'&&h!=='qibla')editing=false;
  if(h==='duas'){renderDuas();return true}
  if(h.startsWith('dua-'))return renderDua(h.slice(4));
  if(h==='prayer'){renderPrayer();return true}
  if(h==='qibla'){renderQibla();return true}
  return false;
};
setInterval(tick,1000);
window.QX={get LOC(){return LOC},get ALERTS(){return ALERTS},timesFor,PR,nextPrayer,fmt,DAILY,LIST,UD,DU,slotFor,get AZ(){return AZ},playAlert,stopAlert,hijriToday:()=>HFMT?hijriToday():null,hijriStr,eventsOn,evTitle,HMU,HM};
})();
