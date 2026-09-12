import { readdir, readFile } from 'node:fs/promises';
import { resolve, join, relative, extname } from 'node:path';
const root = resolve(import.meta.dirname, '../dist');
export async function checkPublicBuild(dir = root) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['assets', 'protocolos'].includes(relative(root, path).split(/[\\/]/)[0])) throw new Error('Directorio no público en dist.');
      await checkPublicBuild(path);
    } else {
      if (!['.html', '.js', '.css', '.json', '.svg', '.mp4', '.png', '.jpg', '.webp'].includes(extname(path)) && entry.name !== '_headers') throw new Error('Archivo no público en dist.');
      if (['.html', '.js', '.css', '.json', '.svg'].includes(extname(path))) {
        const text = await readFile(path, 'utf8');
        if (/OPENAI_API_KEY|OPENAI_CHAT_MODEL|OPENAI_VECTOR_STORE_ID|sk-(?:proj-)?[A-Za-z0-9_-]{20,}|api\.openai\.com/.test(text)) throw new Error(`Referencia privada en ${relative(root, path)}`);
      }
    }
  }
}
await checkPublicBuild();
console.log('Bundle público verificado: sin claves ni configuración OpenAI ni código de backend.');
