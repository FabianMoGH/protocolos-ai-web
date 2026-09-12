import { readdir, readFile, mkdir, writeFile, rename, open, unlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const OWNER = 'tramaclinicamed-public-v1';
const ROOT = resolve(import.meta.dirname, '..');
export async function readLibrary(root = ROOT) {
  const dir = join(root, 'docs/rag-publico');
  const names = (await readdir(dir)).filter(name => name.endsWith('.md')).sort();
  const numbered = names.filter(name => name !== 'README.md');
  if (names.length !== 12 || !names.includes('README.md') || numbered.length !== 11 || numbered.some((name, i) => !name.startsWith(String(i).padStart(2, '0') + '_'))) throw new Error('La biblioteca oficial debe contener los 11 documentos 00–10 y README.md.');
  return Promise.all(names.map(async name => {
    if (!/^(?:\d{2}_[A-Z_]+|README)\.md$/.test(name)) throw new Error('Nombre de documento inválido.');
    const content = await readFile(join(dir, name), 'utf8');
    if (!content.trim() || Buffer.byteLength(content) > 150000) throw new Error(`Tamaño inválido: ${name}`);
    if (/sk-(?:proj-)?[A-Za-z0-9_-]{20,}/.test(content)) throw new Error(`Posible secreto: ${name}`);
    return { name, content, hash: createHash('sha256').update(content).digest('hex') };
  }));
}
export function apiClient(key, fetcher = fetch) {
  return async (path, { method = 'GET', body } = {}) => {
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 60000);
    try {
      const multipart = body instanceof FormData;
      const response = await fetcher(`https://api.openai.com/v1${path}`, { method, signal: controller.signal,
        headers: { Authorization: `Bearer ${key}`, ...(multipart ? {} : { 'Content-Type': 'application/json' }) },
        body: body === undefined ? undefined : multipart ? body : JSON.stringify(body) });
      if (!response.ok) throw new Error(`OpenAI HTTP ${response.status} en ${method} ${path.split('?')[0]}. Sin reintento automático de escrituras.`);
      return await response.json();
    } catch (error) {
      if (error.message.startsWith('OpenAI HTTP')) throw error;
      throw new Error('Conexión OpenAI interrumpida o respuesta inválida. Revisá el estado antes de reintentar.');
    } finally { clearTimeout(timer); }
  };
}
async function listAll(api, path) {
  const rows = []; let after = '';
  for (;;) {
    const page = await api(`${path}?limit=100${after ? `&after=${encodeURIComponent(after)}` : ''}`);
    if (!Array.isArray(page.data)) throw new Error('Listado OpenAI inválido.');
    rows.push(...page.data);
    if (!page.has_more) return rows;
    const next = page.last_id ?? page.data.at(-1)?.id;
    if (!next || next === after) throw new Error('Cursor OpenAI inválido.');
    after = next;
  }
}
export async function syncLibrary({ api, documents, state, saveState, vectorStoreId, log = console.log, wait = ms => new Promise(r => setTimeout(r, ms)), now = Date.now, indexTimeout = 300000 }) {
  let id = vectorStoreId || state.vectorStoreId;
  if (!id) {
    // Recover a previously created managed store if the first run stopped before journaling its ID.
    const existing = (await listAll(api, '/vector_stores')).filter(s => s.name === 'TramaClinicaMed Public RAG' && s.metadata?.managed_by === OWNER);
    if (existing.length > 1) throw new Error('Hay varios vector stores administrados. Configurá OPENAI_VECTOR_STORE_ID explícitamente.');
    id = existing[0]?.id ?? (await api('/vector_stores', { method: 'POST', body: { name: 'TramaClinicaMed Public RAG', metadata: { managed_by: OWNER } } })).id;
  }
  if (!/^vs_[A-Za-z0-9_-]+$/.test(id ?? '')) throw new Error('OPENAI_VECTOR_STORE_ID inválido.');
  await api(`/vector_stores/${id}`); // Never silently replace an inaccessible/deleted configured store.
  if (state.vectorStoreId && state.vectorStoreId !== id) state.pending = {};
  state.vectorStoreId = id; state.pending ??= {}; await saveState(state);
  log(`Vector store: ${id}`);
  const remote = await listAll(api, `/vector_stores/${id}/files`);
  // Fail closed if the configured store contains data outside this public library.
  if (remote.some(f => f.attributes?.managed_by !== OWNER)) throw new Error('El vector store contiene archivos ajenos a esta biblioteca. Usá uno dedicado.');
  const keep = new Set();
  for (const doc of documents) {
    const matches = remote.filter(f => f.attributes?.source_file === doc.name && f.attributes?.sha256 === doc.hash);
    if (matches.some(f => ['failed', 'cancelled'].includes(f.status))) throw new Error(`Indexación fallida previa: ${doc.name}. Revisá el archivo antes de reintentar.`);
    let file = matches.find(f => f.status === 'completed') ?? matches[0];
    if (!file) {
      const key = `${doc.name}:${doc.hash}`;
      let fileId = state.pending[key];
      if (!fileId) {
        const form = new FormData(); form.set('purpose', 'assistants'); form.set('file', new Blob([doc.content], { type: 'text/markdown' }), doc.name);
        fileId = (await api('/files', { method: 'POST', body: form })).id;
        state.pending[key] = fileId; await saveState(state);
      }
      if (!/^file[-_][A-Za-z0-9_-]+$/.test(fileId ?? '')) throw new Error('ID de archivo inválido.');
      file = await api(`/vector_stores/${id}/files`, { method: 'POST', body: { file_id: fileId, attributes: { managed_by: OWNER, source_file: doc.name, sha256: doc.hash } } });
    }
    const deadline = now() + indexTimeout;
    while (file.status === 'in_progress') {
      if (now() >= deadline) throw new Error(`Timeout de indexación: ${doc.name}. Se conserva el estado para reanudar.`);
      await wait(1500); file = await api(`/vector_stores/${id}/files/${file.id}`);
    }
    if (file.status !== 'completed') throw new Error(`Indexación fallida: ${doc.name} (${file.last_error?.code ?? file.status}).`);
    keep.add(file.id); log(`Indexado: ${doc.name}`);
  }
  // Only detach older managed versions after EVERY new document is indexed.
  // Do not delete underlying Files objects, which may be referenced by another store.
  for (const file of remote) if (!keep.has(file.id)) await api(`/vector_stores/${id}/files/${file.id}`, { method: 'DELETE' });
  const final = await listAll(api, `/vector_stores/${id}/files`);
  if (final.length !== documents.length || final.some(f => !keep.has(f.id) || f.status !== 'completed')) throw new Error('La verificación final no coincide con la biblioteca. No habilites el chat todavía.');
  state.pending = {}; await saveState(state);
  log(`OPENAI_VECTOR_STORE_ID=${id}`);
  return id;
}
async function main() {
  const documents = await readLibrary();
  if (process.argv.includes('--dry-run')) { console.log(`Validación local: ${documents.length} documentos. Sin llamadas a OpenAI.`); return; }
  if (!process.env.OPENAI_API_KEY) throw new Error('Configurá OPENAI_API_KEY en .env.rag o en el entorno.');
  const dir = join(ROOT, '.rag-sync'); await mkdir(dir, { recursive: true });
  const lockPath = join(dir, 'sync.lock');
  let lock;
  try { lock = await open(lockPath, 'wx'); } catch { throw new Error('Hay una sincronización activa o interrumpida. Revisá .rag-sync/sync.lock antes de continuar.'); }
  try {
    let state = {};
    try { state = JSON.parse(await readFile(join(dir, 'state.json'), 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw new Error('Estado local inválido; no se sobrescribió.'); }
    const saveState = async value => { await writeFile(join(dir, 'state.tmp'), JSON.stringify(value, null, 2)); await rename(join(dir, 'state.tmp'), join(dir, 'state.json')); };
    await syncLibrary({ api: apiClient(process.env.OPENAI_API_KEY), documents, state, saveState, vectorStoreId: process.env.OPENAI_VECTOR_STORE_ID });
  } finally { await lock.close(); await unlink(lockPath); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main().catch(error => { console.error(error.message); process.exitCode = 1; });
