/* Native layer for the iOS / Android app (Capacitor).
   Only runs inside the installed app; the web version ignores this file. */
(function () {
  const C = window.Capacitor;
  if (!C || !C.isNativePlatform || !C.isNativePlatform()) return;

  const platform = C.getPlatform(); // 'ios' | 'android'
  const LN = C.registerPlugin('LocalNotifications');
  const WB = C.registerPlugin('WidgetBridge');
  const AppP = C.registerPlugin('App');
  const store = {
    get(k, d) { try { const v = localStorage.getItem('qr_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('qr_' + k, JSON.stringify(v)); } catch (e) {} },
  };
  const toast = (m) => { try { window.Q && Q.toast(m); } catch (e) {} };

  /* ---------------- Azan notifications ---------------- */
  const DAYS_AHEAD = 6;           // 6 days x 5 prayers = 30 (iOS allows 64 pending)
  // one Android channel per sound (a channel's sound can't change once created)
  const SOUNDS = {
    builtin: { ch: 'azan', name: 'Azan (Shia)', file: 'azan_short.wav' },
    mecca:   { ch: 'azan_mecca', name: 'Azan (Mecca)', file: 'azan_mecca_short.wav' },
    medina:  { ch: 'azan_medina', name: 'Azan (Medina)', file: 'azan_medina_short.wav' },
    chime:   { ch: 'prayer_chime', name: 'Prayer time (chime)', file: null },
  };
  const soundFor = (k) => SOUNDS[(window.QX && QX.slotFor(k))] || SOUNDS.builtin;
  let alertsOn = store.get('nativeAlerts', false);

  async function ensureChannel() {
    if (platform !== 'android') return;
    try {
      for (const s of Object.values(SOUNDS)) {
        const c = { id: s.ch, name: s.name, description: 'Prayer time alerts', importance: 5, visibility: 1, vibration: true };
        if (s.file) c.sound = s.file;
        await LN.createChannel(c);
      }
    } catch (e) { console.warn('channel', e); }
  }

  async function cancelAll() {
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
          ...(soundFor(k).file ? { sound: soundFor(k).file } : {}),
          channelId: soundFor(k).ch,
          extra: { k, n },
        });
      });
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
  async function startCompass(bearing) {
    const status = () => document.getElementById('qStatus');
    const rose = () => document.getElementById('roseAll');
    if (stopCompass) stopCompass();
    try {
      if (platform === 'ios' && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const r = await DeviceOrientationEvent.requestPermission();
        if (r !== 'granted') { status().textContent = 'Compass permission was not given. You can allow it in Settings.'; return; }
      }
    } catch (e) {}
    const btn = document.getElementById('qStart'); if (btn) btn.hidden = true;
    let shown = null, got = false;
    const onO = (e) => {
      let h = null;
      if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading;         // iOS
      else if (e.absolute !== false && typeof e.alpha === 'number') h = (360 - e.alpha) % 360; // Android
      if (h == null) return;
      const so = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
      h = (h + so + 360) % 360;
      const r = rose(), st = status();
      if (!r || !st) { stop(); return; }
      got = true;
      // unwrap so the dial never spins the long way round
      if (shown == null) shown = -h; else { let d = (-h - shown) % 360; if (d > 180) d -= 360; if (d < -180) d += 360; shown += d; }
      r.style.transform = `rotate(${shown}deg)`;
      const diff = ((bearing - h + 540) % 360) - 180;
      st.innerHTML = Math.abs(diff) < 5
        ? '<b style="color:var(--accent);font-size:17px">✓ You are facing the Qibla</b>'
        : `Turn <b>${diff > 0 ? 'right' : 'left'}</b> ${Math.round(Math.abs(diff))}°`;
    };
    const ev = ('ondeviceorientationabsolute' in window) ? 'deviceorientationabsolute' : 'deviceorientation';
    window.addEventListener(ev, onO);
    const onHash = () => stop();
    window.addEventListener('hashchange', onHash);
    function stop() { window.removeEventListener(ev, onO); window.removeEventListener('hashchange', onHash); stopCompass = null; }
    stopCompass = stop;
    setTimeout(() => { if (!got && status()) status().textContent = 'No compass reading yet — move your phone in a figure-8 to calibrate it.'; }, 3000);
  }

  /* ---------------- App lifecycle ---------------- */
  async function refresh() { await schedule(); await updateWidgets(); }

  window.NH = { alertsOn: () => alertsOn, toggleAlerts, refresh, startCompass, platform };

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
    AppP.addListener('appStateChange', (s) => { if (s && s.isActive) refresh(); });
    AppP.addListener('backButton', () => {
      const h = location.hash.replace('#', '');
      if (h && h !== 'today') history.back(); else AppP.exitApp();
    });
  } catch (e) {}

  const boot = () => setTimeout(async () => { await ensureChannel(); refresh(); }, 800);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
