import { mkdir, readdir, copyFile, lstat, readFile, writeFile } from 'node:fs/promises';
import { resolve, extname, join } from 'node:path';

// An explicit allowlist keeps server code, docs, credentials and journals out of Pages assets.
const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
await mkdir(dist, { recursive: true });
async function copyAssets(source, target) {
  await mkdir(target, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'desktop.ini') continue;
    const from = join(source, entry.name);
    if ((await lstat(from)).isSymbolicLink()) throw new Error('No se publican enlaces simbólicos.');
    if (entry.isDirectory()) await copyAssets(from, join(target, entry.name));
    else if (['.css', '.js', '.svg', '.png', '.jpg', '.webp', '.mp4'].includes(extname(entry.name))) await copyFile(from, join(target, entry.name));
  }
}
for (const file of ['index.html', 'favicon.svg', 'protocolos/index.html']) {
  await mkdir(resolve(dist, file, '..'), { recursive: true });
  await copyFile(join(root, file), join(dist, file));
}
await copyAssets(join(root, 'assets'), join(dist, 'assets'));
await writeFile(join(dist, '_routes.json'), JSON.stringify({ version: 1, include: ['/api/chat'], exclude: [] }));
await writeFile(join(dist, '_headers'), '/assets/assistant.js\n  X-Content-Type-Options: nosniff\n');
// Fail rather than interpolate any environment value into the public site.
for (const file of ['index.html', 'protocolos/index.html']) {
  if (!(await readFile(join(dist, file), 'utf8')).includes('/assets/assistant.js')) throw new Error(`Falta chat en ${file}`);
}
console.log('Sitio estático preparado en dist; código server-side excluido.');
