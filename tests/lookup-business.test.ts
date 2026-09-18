import { test } from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../src/app/api/lookup-business/route';

test('lookup-business fails cleanly when disconnected (no OpenAI key)', async () => {
  const oldKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  
  const req = new Request('http://localhost/api/lookup-business', {
    method: 'POST',
    body: JSON.stringify({ name: 'Acme Corp', city: 'Metropolis' })
  });
  
  const res = await POST(req);
  assert.equal(res.status, 503);
  
  const json = await res.json();
  assert.ok(json.error.includes('OpenAI is not connected'), 'Should return correct error message');
  
  if (oldKey) process.env.OPENAI_API_KEY = oldKey;
});
