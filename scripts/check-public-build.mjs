import { readdir, readFile } from 'node:fs/promises';
import { resolve, join, relative, extname } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const publicRoots = new Set(['assets', 'protocolos']);
const publicFiles = new Set(['index.html', 'favicon.svg', '_routes.json', '_headers']);
const textExtensions = new Set(['.html', '.js', '.css', '.json', '.svg']);
const allowedExtensions = new Set([...textExtensions, '.mp4', '.png', '.jpg', '.webp']);
const secretPattern = /OPENAI_API_KEY|OPENAI_CHAT_MODEL|OPENAI_VECTOR_STORE_ID|sk-(?:proj-)?[A-Za-z0-9_-]{20,}|api\.openai\.com/;

async function checkDirectory(dir, topLevel = false) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    const rel = relative(root, path);
    if (entry.isDirectory()) {
      if (topLevel && !publicRoots.has(entry.name)) continue;
      await checkDirectory(path);
      continue;
    }
    if (topLevel && !publicFiles.has(entry.name)) continue;
    if (!allowedExtensions.has(extname(entry.name)) && entry.name !== '_headers') throw new Error(`Archivo no público: ${rel}`);
    if (textExtensions.has(extname(entry.name))) {
      const text = await readFile(path, 'utf8');
      if (secretPattern.test(text)) throw new Error(`Referencia privada en ${rel}`);
    }
  }
}

const routes = JSON.parse(await readFile(join(root, '_routes.json'), 'utf8'));
if (routes.version !== 1 || JSON.stringify(routes.include) !== JSON.stringify(['/api/chat']) || routes.exclude?.length) throw new Error('_routes.json debe invocar sólo /api/chat.');
for (const file of ['index.html', 'protocolos/index.html']) {
  if (!(await readFile(join(root, file), 'utf8')).includes('/assets/assistant.js')) throw new Error(`Falta chat en ${file}`);
}
await checkDirectory(root, true);
console.log('Sitio estático de raíz verificado: sin secretos ni configuración OpenAI en cliente.');
