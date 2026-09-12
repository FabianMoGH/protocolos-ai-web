import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

test('la publicación es estática desde la raíz y limita la Function a /api/chat', async () => {
  await assert.rejects(access(resolve(root, 'wrangler.jsonc')));
  const routes = JSON.parse(await readFile(resolve(root, '_routes.json'), 'utf8'));
  assert.deepEqual(routes, { version: 1, include: ['/api/chat'], exclude: [] });
  await access(resolve(root, 'functions/api/chat.js'));
  for (const file of ['index.html', 'protocolos/index.html']) {
    const page = await readFile(resolve(root, file), 'utf8');
    assert.match(page, /assets\/assistant\.js/);
  }
});
