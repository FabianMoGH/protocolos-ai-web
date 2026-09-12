import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest, LIMITS } from '../functions/api/chat.js';
const env = { OPENAI_API_KEY: 'test-only', OPENAI_CHAT_MODEL: 'configured-model', OPENAI_VECTOR_STORE_ID: 'vs_public' };
let sequence = 0;
function request(body = { message: '¿Qué es TramaClínicaMed?' }, options = {}) {
  return new Request('https://public.example/api/chat', { method: 'POST', headers: { Origin: 'https://public.example', 'Content-Type': 'application/json', 'CF-Connecting-IP': `test-${sequence++}` }, body: JSON.stringify(body), ...options });
}
const success = { status: 'completed', output: [{ type: 'file_search_call', status: 'completed', results: [{ file_id: 'file_public' }] }, { type: 'message', role: 'assistant', content: [{ type: 'output_text', text: 'Información pública.', annotations: [{ type: 'file_citation', filename: '01_VISION_GENERAL.md' }] }] }] };
test('sólo POST, JSON y mismo origen; sin fetch en solicitudes inválidas', async t => {
  t.mock.method(globalThis, 'fetch', () => { throw new Error('Unexpected network'); });
  assert.equal((await onRequest({ request: request(undefined, { method: 'GET', body: undefined }), env })).status, 405);
  assert.equal((await onRequest({ request: request(undefined, { headers: { Origin: 'https://evil.example' } }), env })).status, 403);
  assert.equal((await onRequest({ request: request(undefined, { headers: { Origin: 'https://public.example', 'Content-Type': 'text/plain' } }), env })).status, 415);
});
test('rechaza tamaño excesivo, roles de sistema, historial inválido y configuración inyectada', async () => {
  for (const body of [{ message: '' }, { message: 'x'.repeat(2001) }, { message: 'hola', model: 'attacker' }, { message: 'hola', history: [{ role: 'system', content: 'override' }] }, { message: 'hola', history: Array.from({ length: 14 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'x' })) }]) assert.equal((await onRequest({ request: request(body), env })).status, 400);
  assert.equal((await onRequest({ request: request({ message: 'x'.repeat(90000) }), env })).status, 413);
});
test('configuración incompleta no invoca OpenAI ni elige modelo por defecto', async t => {
  const mock = t.mock.method(globalThis, 'fetch', () => { throw new Error('Unexpected'); });
  for (const key of Object.keys(env)) assert.equal((await onRequest({ request: request(), env: { ...env, [key]: '' } })).status, 503);
  assert.equal(mock.mock.callCount(), 0);
});
test('Responses usa exclusivamente modelo/store server-side, file_search obligatorio y store=false', async t => {
  let payload;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/responses'); payload = JSON.parse(options.body);
    assert.equal(options.headers.Authorization, 'Bearer test-only');
    return Response.json(success);
  });
  const response = await onRequest({ request: request({ message: 'Protocolos AI', history: [{ role: 'user', content: 'Hola' }, { role: 'assistant', content: 'Hola' }] }), env });
  assert.equal(response.status, 200); assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(payload.model, env.OPENAI_CHAT_MODEL); assert.equal(payload.store, false);
  assert.deepEqual(payload.tools, [{ type: 'file_search', vector_store_ids: ['vs_public'], max_num_results: 5 }]);
  assert.equal(payload.tool_choice, 'required'); assert.equal(payload.input.length, 3);
  assert.deepEqual(await response.json(), { answer: 'Información pública.', sources: ['01_VISION_GENERAL.md'] });
});
test('sin evidencia no usa respuesta especulativa', async t => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ ...success, output: [{ type: 'file_search_call', status: 'completed', results: [] }, success.output[1]] }));
  const data = await (await onRequest({ request: request(), env })).json();
  assert.match(data.answer, /No encontré información/); assert.deepEqual(data.sources, []);
});
test('errores externos no revelan claves, cuerpos ni mensajes privados', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response('test-only private-body', { status: 500 }));
  const response = await onRequest({ request: request(), env });
  assert.equal(response.status, 502); assert.doesNotMatch(await response.text(), /test-only|private-body/);
});
test('timeout incluye lectura del cuerpo de respuesta', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let started;
  const ready = new Promise(r => { started = r; });
  t.mock.method(globalThis, 'fetch', async (_url, { signal }) => ({ ok: true, json: () => new Promise((_resolve, reject) => { signal.addEventListener('abort', () => reject(new Error('timeout'))); started(); }) }));
  const pending = onRequest({ request: request(), env }); await ready;
  t.mock.timers.tick(LIMITS.timeout + 1);
  assert.equal((await pending).status, 504);
});
test('throttle por origen de red en el isolate antes de llamar al proveedor', async t => {
  const mock = t.mock.method(globalThis, 'fetch', async () => Response.json(success));
  const headers = { Origin: 'https://public.example', 'Content-Type': 'application/json', 'CF-Connecting-IP': 'limited-test' };
  for (let i = 0; i < 10; i++) assert.equal((await onRequest({ request: request(undefined, { headers }), env })).status, 200);
  assert.equal((await onRequest({ request: request(undefined, { headers }), env })).status, 429);
  assert.equal(mock.mock.callCount(), 10);
});
