import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';

// Ensure the secret is set before importing middleware
process.env.NEON_AUTH_SECRET = 'test-secret-that-is-at-least-32-chars-long-here';

import middleware from '../src/middleware';

test('middleware is exported and configured for Neon Auth', async () => {
  assert.equal(typeof middleware, 'function', 'Middleware should be exported as default function');
  
  const req = new NextRequest('http://localhost/projects');
  const res = await middleware(req, {} as any);
  
  assert.ok(res !== undefined, 'Middleware should return a response for unauthenticated access');
});
