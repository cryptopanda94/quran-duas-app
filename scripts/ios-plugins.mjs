// Run AFTER `npx cap sync ios`: Capacitor 8 only loads native plugin classes listed in
// ios/App/App/capacitor.config.json → packageClassList, and sync rewrites that file.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const f = join(dirname(fileURLToPath(import.meta.url)), '..', 'ios', 'App', 'App', 'capacitor.config.json');
if (!existsSync(f)) { console.log('ios-plugins: no iOS project yet (skipping)'); process.exit(0); }
const c = JSON.parse(readFileSync(f, 'utf8'));
c.packageClassList = Array.from(new Set([...(c.packageClassList || []), 'WidgetBridgePlugin', 'InAppReviewPlugin']));
writeFileSync(f, JSON.stringify(c, null, '\t') + '\n');
console.log('  ✓ packageClassList:', c.packageClassList.join(', '));
