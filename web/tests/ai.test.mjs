import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost, onRequestGet } from '../functions/api/ai.ts';
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const env = { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'public', GEMINI_API_KEY: 'test-secret' };
const invoke = (body, overrides = env, token = 'token') => onRequestPost({ env: overrides, request: new Request('https://example.com/api/ai', { method: 'POST', headers: token ? { authorization: `Bearer ${token}` } : {}, body: JSON.stringify(body) }) });
const valid = { messages: [{ role: 'user', content: 'Plan my day' }] };
const mock = (response) => { globalThis.fetch = async (url) => String(url).includes('/auth/v1/user') ? Response.json({ id: 'owner' }) : response(); };
test('requires configured auth and a signed-in user', async () => {
  assert.equal((await invoke(valid, {})).status, 503);
  assert.equal((await invoke(valid, env, '')).status, 401);
});
test('rejects malformed request shapes without crashing', async () => {
  mock(() => { throw new Error('must not reach Gemini'); });
  for (const body of [null, [], { messages: {} }, { messages: [null] }, { messages: ['bad'] }, { ...valid, system: 42 }, { ...valid, json: 'yes' }, { messages: [] }]) {
    assert.equal((await invoke(body)).status, 400);
  }
});
test('returns useful errors when Gemini is unavailable or gives no text', async () => {
  mock(() => { throw new Error('network'); });
  assert.equal((await invoke(valid)).status, 504);
  mock(() => Response.json({ candidates: [] }));
  assert.equal((await invoke(valid)).status, 502);
  mock(() => new Response('rate limited', { status: 429 }));
  assert.equal((await invoke(valid)).status, 429);
});
test('authenticated request returns text without exposing the key', async () => {
  mock(() => Response.json({ candidates: [{ content: { parts: [{ text: 'Study IAM for 25 minutes.' }] } }] }));
  const response = await invoke(valid);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await response.text();
  assert.match(body, /Study IAM/);
  assert.ok(!body.includes(env.GEMINI_API_KEY));
});
test('missing Gemini key and wrong method return explicit statuses', async () => {
  mock(() => Response.json({}));
  assert.equal((await invoke(valid, { ...env, GEMINI_API_KEY: undefined })).status, 503);
  assert.equal((await onRequestGet()).status, 405);
});
