import {NextResponse} from 'next/server';
import {z} from 'zod';
import {leadSchema,type Assessment,type Batch} from '@/lib/campaign/model';
import {generate} from '@/lib/campaign/ai';
import * as db from '@/lib/campaign/storage';
import {secretIssues} from '@/lib/factory/validation';
import {body} from '@/lib/factory/http';
export const dynamic='force-dynamic';
const idSchema=z.string().uuid();
export async function GET(){try{return NextResponse.json({history:await db.list<Assessment>('assessment'),batches:await db.list<Batch>('batch'),aiConnected:!!process.env.OPENAI_API_KEY});}catch{return NextResponse.json({error:'Campaign storage could not load. Please retry.'},{status:503});}}
export async function POST(req:Request){try{const data=await body(req);if(secretIssues(JSON.stringify(data)).length)throw new Error('Remove credentials from lead data.');if(data.action==='generate'){const lead=leadSchema.parse(data.lead);const a=await generate(lead);await db.put(a.id,'assessment',a);return NextResponse.json({assessment:a});}
 if(data.action==='batch-create'){const leads=z.array(leadSchema).min(1).max(25).parse(data.leads);const batch:Batch={id:crypto.randomUUID(),name:String(data.name||'Campaign').slice(0,200),createdAt:new Date().toISOString(),revision:1,rows:leads.map(lead=>({id:crypto.randomUUID(),lead,status:'pending'}))};await db.put(batch.id,'batch',batch);return NextResponse.json({batch});}
 if(data.action==='batch-step'){const id=idSchema.parse(data.id);if(!await db.acquire('batch:'+id))return NextResponse.json({error:'Batch is already processing a lead.'},{status:409});try{const batch=await db.get<Batch>(id,'batch');if(!batch||!Array.isArray(batch.rows))throw new Error('Batch not found');const row=batch.rows.find(r=>r.status==='pending'||r.status==='running');if(row){row.status='running';await db.put(id,'batch',batch);try{row.assessment=await generate(row.lead);row.status='success';await db.put(row.assessment.id,'assessment',row.assessment);}catch(e){row.status='error';row.error=e instanceof Error&&e.message.startsWith('OpenAI is not')?e.message:'Generation failed. Check AI connection or retry this row.';}batch.revision++;await db.put(id,'batch',batch);}return NextResponse.json({batch});}finally{await db.release('batch:'+id);}}
 if(data.action==='batch-retry'){const id=idSchema.parse(data.id);if(!await db.acquire('batch:'+id))throw new Error('Wait for the current lead to finish.');try{const batch=await db.get<Batch>(id,'batch');if(!batch||!Array.isArray(batch.rows))throw new Error('Batch not found');for(const r of batch.rows)if(r.status==='error'){r.status='pending';delete r.error;}await db.put(id,'batch',batch);return NextResponse.json({batch});}finally{await db.release('batch:'+id);}}
 if(data.action==='delete'){await db.remove(idSchema.parse(data.id),'assessment');return NextResponse.json({ok:true});}
 if(data.action==='clear'&&data.confirm===true){await db.clear('assessment');return NextResponse.json({ok:true});}
 return NextResponse.json({error:'Unknown action'},{status:400});
 }catch(e){const message=e instanceof Error?e.message:'';return NextResponse.json({error:message.startsWith('OpenAI is not')||message.includes('limit')?message:'Request could not be completed. Check the inputs and try again.'},{status:400});}}
