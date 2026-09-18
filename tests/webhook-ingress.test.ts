import { test } from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../src/app/api/webhook-ingest/route';
import crypto from 'node:crypto';

test('webhook-ingest rejects invalid signatures', async () => {
  const oldSecret = process.env.FACTORY_WEBHOOK_SECRET;
  process.env.FACTORY_WEBHOOK_SECRET = 'test-secret';
  
  const payload = { eventId: '12345', test: true };
  const req = new Request('http://localhost/api/webhook-ingest', {
    method: 'POST',
    headers: {
      'x-factory-timestamp': Date.now().toString(),
      'x-factory-signature': 'invalid-signature'
    },
    body: JSON.stringify(payload)
  });
  
  const res = await POST(req);
  assert.equal(res.status, 401);
  const json = await res.json();
  assert.equal(json.error, 'Invalid or expired signature');
  
  if (oldSecret) process.env.FACTORY_WEBHOOK_SECRET = oldSecret;
});
