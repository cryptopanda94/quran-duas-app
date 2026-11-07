// Copies native/ios/icons/<theme>.png into ios/App/App/Assets.xcassets/AppIcon-<Theme>.appiconset
import { readdirSync, mkdirSync, copyFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'native', 'ios', 'icons');
const cat = join(root, 'ios', 'App', 'App', 'Assets.xcassets');
if (!existsSync(cat)) throw new Error('Assets.xcassets not found — run after cap add ios');
for (const f of readdirSync(src).filter((x) => x.endsWith('.png'))) {
  const name = 'AppIcon-' + f.replace('.png', '').replace(/^./, (c) => c.toUpperCase());
  const dir = join(cat, name + '.appiconset');
  mkdirSync(dir, { recursive: true });
  copyFileSync(join(src, f), join(dir, 'icon.png'));
  writeFileSync(join(dir, 'Contents.json'), JSON.stringify({ images: [{ filename: 'icon.png', idiom: 'universal', platform: 'ios', size: '1024x1024' }], info: { author: 'xcode', version: 1 } }, null, 2));
  console.log('icon set', name);
}
