/* Native layer for the iOS / Android app (Capacitor).
   Only runs inside the installed app; the web version ignores this file. */
(function () {
  const C = window.Capacitor;
  if (!C || !C.isNativePlatform || !C.isNativePlatform()) return;

  const platform = C.getPlatform(); // 'ios' | 'android'
  try { console.log('QD headers ' + JSON.stringify((C.PluginHeaders || []).map((h) => h.name))); } catch (e) {}
  const LN = C.registerPlugin('LocalNotifications');
  const WB = C.registerPlugin('WidgetBridge');
  const AppP = C.registerPlugin('App');
  const store = {
    get(k, d) { try { const v = localStorage.getItem('qr_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('qr_' + k, JSON.stringify(v)); } catch (e) {} },
  };
  const toast = (m) => { try { window.Q && Q.toast(m); } catch (e) {} };

  /* ---------------- Azan notifications ---------------- */
  const DAYS_AHEAD = 12;          // 12 days x 5 prayers = 60 (iOS allows 64 pending)
  // one Android channel per sound (a channel's sound can't change once created)
  const SOUNDS = {
    builtin: { ch: 'azan', name: 'Azan', file: 'azan_short.wav' },
    mecca:   { ch: 'azan_mecca', name: 'Azan (Mecca)', file: 'azan_mecca_short.wav' },
    medina:  { ch: 'azan_medina', name: 'Azan (Medina)', file: 'azan_medina_short.wav' },
    moazenzadeh: { ch: 'azan_moazenzadeh', name: 'Azan (Moazenzadeh)', file: 'azan_moazenzadeh_short.wav' },
    kazemzadeh: { ch: 'azan_kazemzadeh', name: 'Azan (Kazemzadeh)', file: 'azan_kazemzadeh_short.wav' },
    aghati_1: { ch: 'azan_aghati_1', name: 'Azan (Aghati (1))', file: 'azan_aghati_1_short.wav' },
    aghati_2: { ch: 'azan_aghati_2', name: 'Azan (Aghati (2))', file: 'azan_aghati_2_short.wav' },
    rezaeian: { ch: 'azan_rezaeian', name: 'Azan (Rezaeian)', file: 'azan_rezaeian_short.wav' },
    moazenzadeh_2: { ch: 'azan_moazenzadeh_2', name: 'Azan (Moazenzadeh 2)', file: 'azan_moazenzadeh_2_short.wav' },
    abdulbasit: { ch: 'azan_abdulbasit', name: 'Azan (Abdul Basit)', file: 'azan_abdulbasit_short.wav' },
  };
  const soundFor = (k) => SOUNDS[(window.QX && QX.slotFor(k))] || SOUNDS.builtin;
  // user prefs: sound on/off, vibrate on/off (Android: one channel per sound x vibration, since channels can't change)
  const prefs = () => ({ sound: store.get('alertSound', true), vib: store.get('alertVib', true) });
  function alertFor(k) {
    const { sound, vib } = prefs();
    if (sound) { const s = soundFor(k); return { file: s.file, ch: `${s.ch}_v${vib ? 1 : 0}` }; }
    // no azan: a silent sound still lets iPhone vibrate; Android uses a silent channel with/without vibration
    if (vib) return { file: 'silent.wav', ch: 'silent_v1' };
    return { file: platform === 'android' ? 'silent.wav' : null, ch: 'silent_v0' };
  }
  let alertsOn = store.get('nativeAlerts', false);

  async function ensureChannel() {
    if (platform !== 'android') return;
    try {
      for (const old of ['azan', 'azan_mecca', 'azan_medina', 'prayer_chime']) { try { await LN.deleteChannel({ id: old }); } catch (e) {} }
      const list = [...Object.values(SOUNDS), { ch: 'silent', name: 'Prayer time (silent)', file: 'silent.wav' }];
      for (const s of list) for (const v of [1, 0]) {
        await LN.createChannel({ id: `${s.ch}_v${v}`, name: `${s.name}${v ? '' : ' · no vibration'}`,
          description: 'Prayer time alerts', importance: 5, visibility: 1, vibration: !!v, sound: s.file });
      }
    } catch (e) { console.warn('channel', e); }
  }

  // iOS 26+: azan as a real alarm (AlarmKit) so it rings on silent. null = not available
  let alarmState = null;
  async function alarmReady(ask) {
    if (platform !== 'ios' || !WB.alarmStatus) return false;
    try {
      let s = await WB.alarmStatus();
      if (!s.supported) return false;
      if (s.state === 'prompt' && ask) s = await WB.alarmRequest();
      alarmState = s.state;
      return s.state === 'granted';
    } catch (e) { console.warn('alarm', e); return false; }
  }
  async function cancelAll() {
    if (platform === 'ios') { try { await WB.alarmSchedule({ items: [] }); } catch (e) {} }
    try {
      const p = await LN.getPending();
      if (p && p.notifications && p.notifications.length)
        await LN.cancel({ notifications: p.notifications.map((n) => ({ id: n.id })) });
    } catch (e) { console.warn('cancel', e); }
  }

  async function schedule() {
    const QX = window.QX;
    if (!QX) return;
    await cancelAll();
    if (!alertsOn || !QX.LOC) return;
    await ensureChannel();
    const now = Date.now(), list = [], seen = new Set();
    for (let d = 0; d < DAYS_AHEAD; d++) {
      const T = QX.timesFor(QX.LOC, new Date(now + d * 864e5));
      QX.PR.forEach(([k, n, u, main], i) => {
        if (!main || !QX.ALERTS[k] || !T[k]) return;
        const at = T[k].getTime();
        if (at <= now + 5000 || seen.has(at)) return;
        seen.add(at);
        list.push({
          id: d * 10 + i + 1,
          title: `${n} · ${u}`,
          body: `It's time for ${n} prayer — ${QX.LOC.name}`,
          schedule: { at: new Date(at), allowWhileIdle: true },
          ...(alertFor(k).file ? { sound: alertFor(k).file } : {}),
          channelId: alertFor(k).ch,
          extra: { k, n },
        });
      });
    }
    // Sound on + alarms allowed (iOS 26+): ring like an alarm, even on silent — next 7 days
    if (prefs().sound && await alarmReady(false)) {
      const items = list.filter((n) => n.schedule.at.getTime() < now + 7 * 864e5)
        .map((n) => ({ at: n.schedule.at.getTime(), title: n.title, sound: soundFor(n.extra.k).file }));
      try { const r = await WB.alarmSchedule({ items }); if (r && r.scheduled) return; } catch (e) { console.warn('alarms', e); }
    }
    if (list.length) {
      try { await LN.schedule({ notifications: list }); } catch (e) { console.warn('schedule', e); }
    }
  }

  async function toggleAlerts() {
    if (alertsOn) {
      alertsOn = false; store.set('nativeAlerts', false); await cancelAll();
      toast('Azan notifications off'); return;
    }
    try {
      let p = await LN.checkPermissions();
      if (p.display !== 'granted') p = await LN.requestPermissions();
      if (p.display !== 'granted') { toast('Please allow notifications in Settings to get the azan'); return; }
      if (platform === 'android' && LN.checkExactNotificationSetting) {
        try {
          const ex = await LN.checkExactNotificationSetting();
          if (ex && ex.exact_alarm !== 'granted') {
            toast('Allow “Alarms & reminders” so the azan rings on time');
            await LN.changeExactNotificationSetting();
          }
        } catch (e) {}
      }
    } catch (e) { console.warn('perm', e); }
    alertsOn = true; store.set('nativeAlerts', true);
    await alarmReady(true);
    await ensureChannel();
    await schedule();
    toast('Azan notifications on');
  }

  /* ---------------- Widgets (iOS WidgetKit / Android AppWidget) ---------------- */
  function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function widgetPayload() {
    const QX = window.QX, Q = window.Q;
    const now = new Date(), prayers = [], seen = new Set();
    if (QX.LOC) {
      for (let d = 0; d < 3; d++) {
        const T = QX.timesFor(QX.LOC, new Date(now.getTime() + d * 864e5));
        QX.PR.forEach(([k, n, u, main]) => {
          if (!main || !T[k]) return;
          const t = T[k].getTime();
          if (seen.has(t)) return; seen.add(t);
          prayers.push({ k, n, u, t });
        });
      }
      prayers.sort((a, b) => a.t - b.t);
    }
    const ayahs = [];
    for (let i = 0; i < 8; i++) {
      const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const idx = Math.floor(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()) / 864e5) % QX.DAILY.length;
      const [s, a, b] = QX.DAILY[idx];
      const vs = []; for (let v = a; v <= b; v++) vs.push(v);
      ayahs.push({
        d: ymd(dt),
        ref: `${Q.META[s - 1][1]} ${s}:${a}${b > a ? '–' + b : ''}`,
        ar: vs.map((v) => Q.WU[s - 1][v - 1]).join(' ۝ '),
        en: vs.map((v) => Q.EN[s - 1][v - 1]).join(' '),
        s, a,
      });
    }
    let hijri = '';
    try { const h = QX.hijriToday(); if (h) hijri = QX.hijriStr(h); } catch (e) {}
    return { v: 1, loc: QX.LOC ? QX.LOC.name : '', updated: now.getTime(), prayers, ayahs, hijri };
  }
  async function updateWidgets() {
    if (!window.QX || !window.Q) return;
    try { await WB.update({ data: JSON.stringify(widgetPayload()) }); } catch (e) { console.warn('widget', e); }
  }

  /* ---------------- Live Qibla compass ---------------- */
  let stopCompass = null;
  let appBuild = '';
  try { AppP.getInfo().then((i) => { appBuild = i.version + ' (' + i.build + ')'; }).catch(() => {}); } catch (e) {}
  async function startCompass(bearing) {
    const status = () => document.getElementById('qStatus');
    const diag = { src: '', n: 0, err: '', acc: null, tru: null }; const t0 = Date.now();
    const showDiag = () => {
      let el = document.getElementById('qDiag');
      const card = status() && status().parentNode;
      if (!el && card) { el = document.createElement('div'); el.id = 'qDiag'; el.style.cssText = 'font-size:11px;color:var(--muted);margin-top:10px;font-family:ui-monospace,monospace'; card.appendChild(el); }
      if (el) el.style.display = (diag.err || (diag.n === 0 && Date.now() - t0 > 4000)) ? '' : 'none';
      if (el) el.textContent = `${platform} ${appBuild} · ${diag.src || '…'} · readings ${diag.n}` + (diag.acc != null ? ` · ±${Math.round(diag.acc)}°` : '') + (diag.tru != null ? (diag.tru ? ' · true N' : ' · magnetic N') : '') + (diag.err ? ` · ${diag.err}` : '');
    };
    const diagTimer = setInterval(() => { if (!document.getElementById('qStatus')) clearInterval(diagTimer); else showDiag(); }, 500);
    const rose = () => document.getElementById('roseAll');
    if (stopCompass) stopCompass();
    const btn = document.getElementById('qStart'); if (btn) btn.hidden = true;
    let shown = null, got = false;
    const show = (h) => {
      const r = rose(), st = status();
      if (!r || !st) { stop(); return; }
      got = true;
      // unwrap so the dial never spins the long way round
      if (shown == null) shown = -h; else { let d = (-h - shown) % 360; if (d > 180) d -= 360; if (d < -180) d += 360; shown += d; }
      r.style.transform = `rotate(${shown}deg)`;
      const diff = ((bearing - h + 540) % 360) - 180;
      const ok = Math.abs(diff) < 5;
      st.classList.toggle('ok', ok);
      st.textContent = ok ? '✓ You are facing the Qibla' : `Turn ${diff > 0 ? 'right' : 'left'} ${Math.round(Math.abs(diff))}°`;
      const dial = document.getElementById('qDial');
      if (dial && dial.classList.contains('aligned') !== ok) {
        dial.classList.toggle('aligned', ok);
        if (ok && navigator.vibrate) try { navigator.vibrate(40); } catch (e) {}
      }
    };
    let stop = () => {};
    const onHash = () => stop();
    window.addEventListener('hashchange', onHash);

    if (platform === 'ios') {
      // iOS: read the heading from Core Location (works without any web permission prompt)
      let sub = null;
      try {
        diag.src = 'native';
        sub = await WB.addListener('heading', (d) => { diag.n++; if (d) { diag.acc = d.acc; diag.tru = d.true; } if (d && typeof d.h === 'number') show(d.h); });
        await WB.startHeading();
      } catch (e) {
        diag.err = String((e && e.message) || e).slice(0, 80);
        if (sub) sub.remove();
        status().textContent = 'Compass not available on this device.';
        const rb = document.getElementById('qStart'); if (rb) rb.hidden = false;
        window.removeEventListener('hashchange', onHash); return;
      }
      // fallback: if Core Location sends nothing within 3 s, also listen to the web view's compass events
      const onO = (e) => { if (typeof e.webkitCompassHeading === 'number') { diag.n++; diag.src = 'native+web'; show(e.webkitCompassHeading); } };
      setTimeout(async () => {
        if (got || !document.getElementById('qStatus')) return;
        try { if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) { const r = await DeviceOrientationEvent.requestPermission(); if (r !== 'granted') diag.err = 'motion permission: ' + r; } } catch (e) { diag.err = 'motion: ' + String((e && e.message) || e).slice(0, 60); }
        window.addEventListener('deviceorientation', onO);
      }, 3000);
      stop = () => { try { sub && sub.remove(); WB.stopHeading(); } catch (e) {} window.removeEventListener('deviceorientation', onO); window.removeEventListener('hashchange', onHash); stopCompass = null; };
    } else {
      const onO = (e) => {
        let h = null;
        if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading;
        else if (e.absolute !== false && typeof e.alpha === 'number') h = (360 - e.alpha) % 360;
        if (h == null) return;
        const so = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
        show((h + so + 360) % 360);
      };
      const ev = ('ondeviceorientationabsolute' in window) ? 'deviceorientationabsolute' : 'deviceorientation';
      window.addEventListener(ev, onO);
      stop = () => { window.removeEventListener(ev, onO); window.removeEventListener('hashchange', onHash); stopCompass = null; };
    }
    stopCompass = () => stop();
    setTimeout(() => { if (!got && status()) status().textContent = 'No compass reading yet — move your phone in a figure-8 to calibrate it.'; }, 4000);
  }

  /* ---------------- App lifecycle ---------------- */
  async function refresh() { await schedule(); await updateWidgets(); }

  async function getLocation() {
    if (platform === 'ios') return await WB.getLocation();
    return await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(
      (p) => res({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy }), rej,
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 600000 }));
  }

  async function setPref(key, val) { store.set(key, val); await schedule(); }

  // Home-screen icon follows the theme (iOS alternate icons; maroon = main icon)
  async function setIcon(theme) {
    if (platform !== 'ios') return;
    const name = !theme || theme === 'sky' ? '' : 'AppIcon-' + theme[0].toUpperCase() + theme.slice(1);
    try { await WB.setIcon({ name }); } catch (e) { console.warn('icon', e); }
  }

  /* ---------------- Offline Quran recitation ----------------
     Surah audio is saved on the device (not in iCloud backups) and played from there.
     Anything played online is saved automatically (if enabled); "Download all" saves the rest. */
  const FS = C.registerPlugin('Filesystem');
  const DIR = platform === 'ios' ? 'LIBRARY_NO_CLOUD' : 'DATA';
  const AUD_DIR = 'quran-audio';
  let audBase = null;                                  // native file URI of AUD_DIR
  const audIdx = store.get('offAud', {});              // key -> bytes
  const audKey = (url) => String(url).replace(/^https?:\/\/[^/]+\/[^/]+\/audio\//, '').replace(/[^A-Za-z0-9._-]/g, '_');
  const saving = {};
  let bulk = null;                                     // {done,total,stop}
  const audReady = (async () => {
    try { await FS.mkdir({ path: AUD_DIR, directory: DIR, recursive: true }); } catch (e) {}
    try { audBase = (await FS.getUri({ path: AUD_DIR, directory: DIR })).uri; } catch (e) { audBase = null; }
  })();
  const b64 = (blob) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = rej; r.readAsDataURL(blob); });
  async function audSave(url) {
    const k = audKey(url);
    if (audIdx[k] || saving[k]) return saving[k];
    return (saving[k] = (async () => {
      await audReady;
      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const blob = await r.blob();
      const tmp = AUD_DIR + '/' + k + '.part', CH = 1536 * 1024;   // write in chunks to keep memory low
      for (let o = 0; o < blob.size; o += CH) {
        const data = await b64(blob.slice(o, o + CH));
        if (o === 0) await FS.writeFile({ path: tmp, data, directory: DIR, recursive: true });
        else await FS.appendFile({ path: tmp, data, directory: DIR });
      }
      try { await FS.deleteFile({ path: AUD_DIR + '/' + k, directory: DIR }); } catch (e) {}
      await FS.rename({ from: tmp, to: AUD_DIR + '/' + k, directory: DIR, toDirectory: DIR });
      audIdx[k] = blob.size; store.set('offAud', audIdx);
    })().finally(() => { delete saving[k]; }));
  }
  const audio = {
    local(url) { const k = audKey(url); return audIdx[k] && audBase ? C.convertFileSrc(audBase + '/' + k) : null; },
    has(url) { return !!audIdx[audKey(url)]; },
    autoOn: () => store.get('audAuto', true),
    setAuto(v) { store.set('audAuto', !!v); },
    played(url) { if (audio.autoOn()) audSave(url).catch(() => {}); },
    forget(url) { const k = audKey(url); delete audIdx[k]; store.set('offAud', audIdx); },
    stats(urls) {
      const ks = urls ? urls.map(audKey) : Object.keys(audIdx);
      let n = 0, bytes = 0; ks.forEach((k) => { if (audIdx[k]) { n++; bytes += audIdx[k]; } });
      return { n, total: ks.length, mb: Math.round(bytes / 1048576) };
    },
    busy: () => bulk && { done: bulk.done, total: bulk.total },
    async downloadAll(urls, onProgress) {
      if (bulk) return;
      const todo = urls.filter((u) => !audIdx[audKey(u)]);
      bulk = { done: 0, total: todo.length, stop: false, failed: 0 };
      const b = bulk; onProgress && onProgress(b);
      let i = 0;
      const worker = async () => {
        while (!b.stop && i < todo.length) {
          const u = todo[i++];
          try { await audSave(u); } catch (e) { b.failed++; }
          b.done++; onProgress && onProgress(b);
        }
      };
      await Promise.all([worker(), worker()]);
      bulk = null; onProgress && onProgress(Object.assign(b, { finished: true }));
    },
    stop() { if (bulk) bulk.stop = true; },
    async removeAll(urls) {
      await audReady;
      const ks = urls ? urls.map(audKey) : Object.keys(audIdx);
      for (const k of ks) { if (!audIdx[k]) continue; try { await FS.deleteFile({ path: AUD_DIR + '/' + k, directory: DIR }); } catch (e) {} delete audIdx[k]; }
      store.set('offAud', audIdx);
    },
  };

  window.NH = { setPref, alertsOn: () => alertsOn, toggleAlerts, refresh, startCompass, getLocation, platform, setIcon, audio };

  try {
    LN.addListener('localNotificationReceived', (n) => {
      const x = (n && n.extra) || {};
      if (x.n && window.QX) QX.playAlert(x.n, x.k);   // app is open: play the full chosen azan
    });
    LN.addListener('localNotificationActionPerformed', (a) => {
      const x = (a && a.notification && a.notification.extra) || {};
      location.hash = 'prayer';
      if (x.n && window.QX) setTimeout(() => QX.playAlert(x.n, x.k), 400);
    });
  } catch (e) {}
  try {
    AppP.addListener('appStateChange', (s) => { if (s && s.isActive) { refresh(); window.QX && QX.autoLocate && QX.autoLocate(true); } });
    AppP.addListener('backButton', () => {
      const h = location.hash.replace('#', '');
      if (h && h !== 'today') history.back(); else AppP.exitApp();
    });
  } catch (e) {}

  setTimeout(() => { try { WB.stopHeading().then(() => console.log('QD WB ok')).catch((e) => console.log('QD WB fail ' + ((e && e.message) || e))); } catch (e) { console.log('QD WB throw ' + e); } }, 1500);
  const boot = () => setTimeout(async () => { await ensureChannel(); refresh(); window.QX && QX.autoLocate && QX.autoLocate(false); }, 800);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
