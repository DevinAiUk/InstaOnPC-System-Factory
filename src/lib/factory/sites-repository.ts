import type {FactoryProject} from './model';
import type {Project} from '../types';
import {hydrate} from './store';
import {SEED_PROJECTS} from '../mock-data/seed';
import * as db from '../campaign/storage';
export async function getProjects(){let rows=await db.list<FactoryProject>('project');if(!rows.length){for(const p of SEED_PROJECTS){const value=hydrate(p,true);await db.insert(value.id,'project',value);}rows=await db.list<FactoryProject>('project');}return rows;}
export async function getProject(id:string){return db.get<FactoryProject>(id,'project');}
export async function createProject(data:Partial<Project>){const id='proj_'+crypto.randomUUID();const p=hydrate({id,name:data.businessProfile!.name,status:'building',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),businessProfile:{...data.businessProfile!,id:'bp_'+id,projectId:id}});await db.insert(id,'project',p);return p;}
export async function mutate(id:string,change:(p:FactoryProject)=>void,action:string){const database=await db.initialize();const row=await database.prepare('SELECT payload,revision FROM factory_documents WHERE id=? AND kind=?').bind(id,'project').first<{payload:string;revision:number}>();if(!row)throw new Error('Project not found');const p:FactoryProject=JSON.parse(row.payload);change(p);p.revision++;p.updatedAt=new Date().toISOString();p.auditLog=[{id:crypto.randomUUID(),projectId:id,action,target:id,performedBy:'Operator',timestamp:p.updatedAt},...(p.auditLog||[])].slice(0,1000);const r=await database.prepare('UPDATE factory_documents SET payload=?,revision=revision+1,updated_at=? WHERE id=? AND revision=?').bind(JSON.stringify(p),p.updatedAt,id,row.revision).run();if(!r.meta.changes)throw new Error('Workspace version changed. Reload and try again.');return p;}
export async function deleteProject(id:string){await db.remove(id,'project');return true;}
