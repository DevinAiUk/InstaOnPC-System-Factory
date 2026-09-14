import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const server=spawn(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','dev','--config','dist/server/wrangler.json','--local','--persist-to','.wrangler/state','--ip','127.0.0.1','--inspector-port','0','--port','8872','--var','FACTORY_HOST:sites'],{stdio:['ignore','pipe','pipe']});
let logs='';server.stdout.on('data',c=>logs+=c);server.stderr.on('data',c=>logs+=c);
const base='http://127.0.0.1:8872';
async function call(path,data){const r=await fetch(base+path,{method:data?'POST':'GET',headers:data?{'content-type':'application/json'}:undefined,body:data?JSON.stringify(data):undefined});return {status:r.status,data:await r.json()};}
try{
 let live=false;for(let i=0;i<100;i++){try{await fetch(base+'/api/campaign');live=true;break;}catch{}await new Promise(r=>setTimeout(r,200));}
 if(!live)throw new Error('Runtime did not start: '+logs.slice(-2500));
 const projects=await call('/api/projects');assert.equal(projects.status,200,JSON.stringify(projects));assert.equal(projects.data.projects.length,3);console.log('PASS: durable fixture seeding');
 for(const path of ['/','/campaign','/projects','/settings','/projects/proj_01/skills','/projects/proj_01/export']){const r=await fetch(base+path);const html=await r.text();assert.equal(r.status,200,path+' '+html.slice(0,100));assert.ok(html.length>1000);console.log('PASS: rendered '+path);}
 const lead={businessName:'Runtime verification fixture',city:'Tampa'};
 const created=await call('/api/campaign',{action:'batch-create',name:'Runtime test',leads:[lead]});assert.equal(created.status,200,JSON.stringify(created));const id=created.data.batch.id;
 const list=await call('/api/campaign');assert.ok(list.data.batches.some(b=>b.id===id));console.log('PASS: durable batch creation and readback');
 const step=await call('/api/campaign',{action:'batch-step',id});assert.equal(step.data.batch.rows[0].status,'error');assert.match(step.data.batch.rows[0].error,/OpenAI is not connected/);console.log('PASS: missing AI credentials fail visibly without fake output');
 const eventId=crypto.randomUUID();const payload={schemaVersion:'1.0',event:'lead.created',eventId,lead};const first=await call('/api/webhook',{action:'test',payload});const second=await call('/api/webhook',{action:'test',payload});assert.equal(first.data.duplicate,false);assert.equal(second.data.duplicate,true);console.log('PASS: ingestion deduplication');
 const blocked=await call('/api/webhook',{action:'dispatch',confirm:true,endpoint:'https://example.com/',deliveryId:crypto.randomUUID(),payload});assert.equal(blocked.status,400);console.log('PASS: outbound endpoint blocked without allowlist');
 const chat=await call('/api/chat',{messages:[{role:'user',content:'Hello'}]});assert.equal(chat.status,503);console.log('PASS: chatbot connection state');
 const search=await call('/api/search?q=Suncoast');assert.equal(search.status,200);assert.ok(search.data.results.length>0);console.log('PASS: workspace search');
 console.log('Runtime verification complete. Only fictional data was used in the local database.');
}catch(e){console.error(e.message);console.error(logs.slice(-1800));process.exitCode=1;}finally{server.kill('SIGTERM');}
