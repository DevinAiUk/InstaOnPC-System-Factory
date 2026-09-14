import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { middleware } from '../src/middleware';
test('host-aware CSRF check accepts same-host proxy requests and rejects foreign origins',()=>{
 const good=new NextRequest('http://internal:4173/api/projects',{method:'POST',headers:{host:'terminal.local:4173',origin:'http://terminal.local:4173'}});
 const bad=new NextRequest('http://internal:4173/api/projects',{method:'POST',headers:{host:'terminal.local:4173',origin:'https://attacker.example'}});
 assert.equal(middleware(good).status,200);assert.equal(middleware(bad).status,403);
});
const testEnv = process.env as Record<string, string | undefined>;
test('production fails closed without configured authentication; password gates all routes',()=>{
 const old=process.env.NODE_ENV;testEnv.NODE_ENV='production';delete process.env.FACTORY_LOCAL_ONLY;delete process.env.FACTORY_ACCESS_PASSWORD;
 assert.equal(middleware(new NextRequest('http://localhost/')).status,503);
 process.env.FACTORY_ACCESS_PASSWORD='test-only-password';assert.equal(middleware(new NextRequest('http://localhost/api/projects')).status,401);
 assert.equal(middleware(new NextRequest('http://localhost/',{headers:{authorization:'Basic '+btoa('operator:test-only-password')}})).status,200);
 delete process.env.FACTORY_ACCESS_PASSWORD;testEnv.NODE_ENV=old;
});
