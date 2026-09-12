import test from 'node:test';
import assert from 'node:assert/strict';
import { syncLibrary, readLibrary, OWNER, apiClient } from '../scripts/sync-public-rag.mjs';
function fake() {
  const stores = []; const files = new Map(); const uploads = []; const calls = [];
  const api = async (path, { method = 'GET', body } = {}) => {
    calls.push({ path, method });
    if (path.startsWith('/vector_stores?')) return { data: stores, has_more: false };
    if (path === '/vector_stores' && method === 'POST') { const store = { ...body, id: 'vs_mock' }; stores.push(store); return store; }
    if (path === '/vector_stores/vs_mock') return stores[0] ?? { id: 'vs_mock' };
    if (path === '/files') { const id = `file_${uploads.length}`; uploads.push(body); return { id }; }
    if (path.includes('/files?')) return { data: [...files.values()], has_more: false };
    if (path.endsWith('/files') && method === 'POST') { const file = { id: body.file_id, attributes: body.attributes, status: 'in_progress' }; files.set(file.id, file); return file; }
    const id = path.split('/').at(-1);
    if (method === 'DELETE') { files.delete(id); return { deleted: true }; }
    const file = files.get(id); file.status = 'completed'; return file;
  };
  return { api, files, uploads, calls };
}
const doc = { name: '00_INDEX.md', content: 'Contenido público', hash: 'hash1' };
test('la biblioteca oficial incluye los once documentos y README sin duplicados', async () => {
  const documents = await readLibrary();
  assert.equal(documents.length, 12);
  assert.equal(new Set(documents.map(doc => doc.name)).size, 12);
  assert.ok(documents.some(doc => doc.name === 'README.md'));
});
test('primera carga, espera de indexación e idempotencia sin nuevas subidas', async () => {
  const f = fake(); const state = {}; const output = [];
  const opts = { api: f.api, documents: [doc], state, saveState: async () => {}, wait: async () => {}, log: line => output.push(line) };
  assert.equal(await syncLibrary(opts), 'vs_mock'); assert.equal(f.uploads.length, 1);
  await syncLibrary(opts); assert.equal(f.uploads.length, 1); assert.equal(f.files.size, 1);
  assert.equal(output.at(-1), 'OPENAI_VECTOR_STORE_ID=vs_mock');
  await syncLibrary({ ...opts, documents: [{ ...doc, hash: 'hash2', content: 'Nuevo' }] });
  assert.equal(f.uploads.length, 2); assert.equal(f.files.size, 1);
  const deletion = f.calls.findIndex(c => c.method === 'DELETE');
  assert.ok(deletion > f.calls.findIndex(c => c.path.endsWith('/file_1') && c.method === 'GET'));
});
test('rechaza store con documentos ajenos sin subir ni eliminar', async () => {
  const f = fake(); f.files.set('private', { id: 'private', status: 'completed' });
  await assert.rejects(syncLibrary({ api: f.api, documents: [doc], state: {}, saveState: async () => {}, vectorStoreId: 'vs_mock', log() {} }), /ajenos/);
  assert.equal(f.uploads.length, 0); assert.equal(f.files.size, 1);
});
test('indexación fallida conserva versiones anteriores', async () => {
  const f = fake(); f.files.set('file_old', { id: 'file_old', status: 'completed', attributes: { managed_by: OWNER, source_file: doc.name, sha256: 'old' } });
  const api = async (...args) => { const value = await f.api(...args); if (args[0].endsWith('/file_0')) return { ...value, status: 'failed', last_error: { code: 'invalid_file' } }; return value; };
  await assert.rejects(syncLibrary({ api, documents: [doc], state: {}, saveState: async () => {}, wait: async () => {}, log() {} }), /Indexación fallida/);
  assert.ok(f.files.has('file_old')); assert.ok(!f.calls.some(c => c.method === 'DELETE'));
});
test('subida pendiente se reutiliza después de interrupción', async () => {
  const f = fake(); const state = { vectorStoreId: 'vs_mock', pending: { '00_INDEX.md:hash1': 'file_pending' } };
  await syncLibrary({ api: f.api, documents: [doc], state, saveState: async () => {}, wait: async () => {}, log() {} });
  assert.equal(f.uploads.length, 0); assert.ok(f.files.has('file_pending'));
});
test('errores API no registran cuerpo ni credencial', async () => {
  await assert.rejects(apiClient('test-secret', async () => new Response('test-secret', { status: 401 }))('/files'), error => error.message.includes('401') && !error.message.includes('test-secret'));
});
test('timeout de indexación detiene sin eliminar la versión anterior', async () => {
  const f = fake(); let clock = 0;
  f.files.set('file_old', { id: 'file_old', status: 'completed', attributes: { managed_by: OWNER, source_file: doc.name, sha256: 'old' } });
  const api = async (...args) => { const value = await f.api(...args); return args[0].endsWith('/file_0') ? { ...value, status: 'in_progress' } : value; };
  await assert.rejects(syncLibrary({ api, documents: [doc], state: {}, saveState: async () => {}, wait: async () => { clock += 1500; }, now: () => clock, indexTimeout: 1000, log() {} }), /Timeout/);
  assert.ok(f.files.has('file_old')); assert.ok(!f.calls.some(c => c.method === 'DELETE'));
});
