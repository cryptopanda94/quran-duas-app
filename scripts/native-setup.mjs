// Wires the custom native code into the projects that `npx cap add ios` / `npx cap add android` generate.
// Safe to run more than once.   Run:  npm run native:setup
import { existsSync, readFileSync, writeFileSync, copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const nat = join(root, 'native');
const ok = (m) => console.log('  ✓ ' + m);
const todo = [];
const read = (p) => readFileSync(p, 'utf8');
const copyDir = (from, to) => {
  mkdirSync(to, { recursive: true });
  for (const f of readdirSync(from)) copyFileSync(join(from, f), join(to, f));
};

/* ============================ iOS ============================ */
async function setupIOS() {
  const app = join(root, 'ios', 'App', 'App');
  if (!existsSync(app)) { console.log('iOS: no ios/ folder yet — run `npx cap add ios` first (skipping)'); return; }
  console.log('iOS:');

  // 1. Swift files for the App target
  const swift = ['MainViewController.swift', 'WidgetBridgePlugin.swift'];
  for (const f of swift) copyFileSync(join(nat, 'ios', 'App', f), join(app, f));
  ok('copied ' + swift.join(', '));

  // 2. Add them to the Xcode project (App target) with minimal, exact text edits
  const pbx = join(root, 'ios', 'App', 'App.xcodeproj', 'project.pbxproj');
  try {
    let t = read(pbx);
    const id = () => Array.from({ length: 24 }, () => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('');
    const insertAfter = (marker, text, from = 0) => {
      const at = t.indexOf(marker, from);
      if (at < 0) throw new Error('marker not found: ' + marker);
      t = t.slice(0, at + marker.length) + text + t.slice(at + marker.length);
    };
    let added = 0;
    for (const f of swift) {
      if (t.includes(`/* ${f} */`)) continue;
      const ref = id(), build = id();
      insertAfter('/* Begin PBXBuildFile section */\n', `\t\t${build} /* ${f} in Sources */ = {isa = PBXBuildFile; fileRef = ${ref} /* ${f} */; };\n`);
      insertAfter('/* Begin PBXFileReference section */\n', `\t\t${ref} /* ${f} */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = ${f}; sourceTree = "<group>"; };\n`);
      const g = t.search(/\n\t\t[0-9A-F]{24} \/\* App \*\/ = \{\n\t\t\tisa = PBXGroup;/);
      if (g < 0) throw new Error('App group not found');
      insertAfter('children = (\n', `\t\t\t\t${ref} /* ${f} */,\n`, g);
      const sp = t.indexOf('/* Begin PBXSourcesBuildPhase section */');
      insertAfter('files = (\n', `\t\t\t\t${build} /* ${f} in Sources */,\n`, sp);
      added++;
    }
    if (added) { copyFileSync(pbx, pbx + '.backup'); writeFileSync(pbx, t); }
    ok(added ? `added ${added} file(s) to the App target` : 'Swift files already in the App target');
  } catch (e) {
    todo.push('In Xcode, drag MainViewController.swift and WidgetBridgePlugin.swift (in App/App) into the "App" folder, tick target "App". (' + e.message + ')');
  }

  // 3. Use our view controller (registers WidgetBridge, background audio)
  const sb = join(app, 'Base.lproj', 'Main.storyboard');
  if (existsSync(sb)) {
    let s = read(sb);
    if (!s.includes('customClass="MainViewController"')) {
      s = s.replace('customClass="CAPBridgeViewController"', 'customClass="MainViewController"')
           .replace('customModule="Capacitor"', 'customModule="App" customModuleProvider="target"');
      writeFileSync(sb, s);
    }
    s.includes('customClass="MainViewController"') ? ok('Main.storyboard uses MainViewController')
      : todo.push('In Main.storyboard set the Bridge View Controller class to MainViewController (module App).');
  }

  // 4. Info.plist: background audio + motion (Qibla compass)
  const plist = join(app, 'Info.plist');
  let p = read(plist);
  const addKey = (key, xml) => { if (!p.includes(`<key>${key}</key>`)) p = p.replace(/<\/dict>\s*<\/plist>\s*$/, `\t<key>${key}</key>\n\t${xml}\n</dict>\n</plist>\n`); };
  addKey('UIBackgroundModes', '<array>\n\t\t<string>audio</string>\n\t</array>');
  addKey('NSMotionUsageDescription', '<string>The Qibla compass uses your phone\'s motion sensors to show which way to face.</string>');
  addKey('ITSAppUsesNonExemptEncryption', '<false/>');
  addKey('NSAlarmKitUsageDescription', '<string>Plays the azan at each prayer time, even when your iPhone is on silent.</string>');
  addKey('NSLocationWhenInUseUsageDescription', '<string>Your location sets your prayer times automatically and lets the Qibla compass point from true north.</string>');
  // home-screen name with a proper (escaped) ampersand
  p = p.replace(/(<key>CFBundleDisplayName<\/key>\s*<string>)[^<]*(<\/string>)/, '$1Quran &amp; Duas$2');
  writeFileSync(plist, p);
  ok('Info.plist: background audio, compass permission text');

  // 5. Widget extension (created once in Xcode — see README step "Add the widget")
  const wdir = join(root, 'ios', 'App', 'QuranWidget');
  if (existsSync(wdir)) {
    for (const f of readdirSync(wdir)) {
      if (f.endsWith('.swift') && f !== 'QuranWidgetBundle.swift')
        writeFileSync(join(wdir, f), '// Not used — all widget code is in QuranWidgetBundle.swift\nimport Foundation\n');
    }
    copyFileSync(join(nat, 'ios', 'QuranWidget', 'QuranWidgetBundle.swift'), join(wdir, 'QuranWidgetBundle.swift'));
    ok('QuranWidget: widget code installed');
  } else {
    todo.push('Add the widget target in Xcode (README → "Add the widget"), then run `npm run native:setup` again.');
  }
}

/* ========================== Android ========================== */
function setupAndroid() {
  const main = join(root, 'android', 'app', 'src', 'main');
  if (!existsSync(main)) { console.log('Android: no android/ folder yet — run `npx cap add android` first (skipping)'); return; }
  console.log('Android:');

  // 1. Java sources
  const pkgDir = join(main, 'java', 'com', 'cryptopanda94', 'quranduas');
  mkdirSync(pkgDir, { recursive: true });
  const kt = join(pkgDir, 'MainActivity.kt');
  if (existsSync(kt)) rmSync(kt);
  copyDir(join(nat, 'android', 'java'), pkgDir);
  ok('Java sources (MainActivity, WidgetBridge, PrayerWidget, AyahWidget)');

  // 2. Resources
  const res = join(main, 'res');
  for (const d of ['layout', 'xml', 'drawable']) copyDir(join(nat, 'android', 'res', d), join(res, d));
  mkdirSync(join(res, 'raw'), { recursive: true });
  for (const f of readdirSync(join(nat, 'shared'))) if (f.endsWith('.wav')) copyFileSync(join(nat, 'shared', f), join(res, 'raw', f));
  ok('widget layouts, notification icon, azan sound');

  // 3. Strings
  const strings = join(res, 'values', 'strings.xml');
  let s = read(strings);
  const addStr = (name, val) => { if (!s.includes(`name="${name}"`)) s = s.replace('</resources>', `    <string name="${name}">${val}</string>\n</resources>`); };
  addStr('widget_prayer_desc', 'Next prayer time with a countdown');
  addStr('widget_ayah_desc', 'Ayah of the day in Arabic and English');
  s = s.replace(/(<string name="app_name">)[^<]*(<\/string>)/, '$1Quran &amp; Duas$2')
       .replace(/(<string name="title_activity_main">)[^<]*(<\/string>)/, '$1Quran &amp; Duas$2');
  writeFileSync(strings, s);

  // 4. Manifest: widgets + permissions
  const man = join(main, 'AndroidManifest.xml');
  let m = read(man);
  const perms = ['android.permission.ACCESS_COARSE_LOCATION', 'android.permission.ACCESS_FINE_LOCATION', 'android.permission.POST_NOTIFICATIONS', 'android.permission.SCHEDULE_EXACT_ALARM', 'android.permission.RECEIVE_BOOT_COMPLETED', 'android.permission.WAKE_LOCK'];
  for (const pm of perms) if (!m.includes(`"${pm}"`)) m = m.replace(/(<manifest[^>]*>)/, `$1\n    <uses-permission android:name="${pm}" />`);
  const receiver = (cls, label, info) => `
        <receiver android:name=".${cls}" android:label="${label}" android:exported="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data android:name="android.appwidget.provider" android:resource="@xml/${info}" />
        </receiver>`;
  if (!m.includes('.PrayerWidget')) m = m.replace('</application>', receiver('PrayerWidget', 'Next Prayer', 'prayer_widget_info') + '\n    </application>');
  if (!m.includes('.AyahWidget')) m = m.replace('</application>', receiver('AyahWidget', 'Ayah of the Day', 'ayah_widget_info') + '\n    </application>');
  writeFileSync(man, m);
  ok('AndroidManifest: widgets, notification & alarm permissions');
}

await setupIOS();
setupAndroid();
if (todo.length) {
  console.log('\nStill to do by hand:');
  todo.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
} else console.log('\nAll native wiring done.');
