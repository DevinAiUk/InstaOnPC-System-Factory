import { Workspace } from "@/components/factory/workspace";
import { getProject,getProjects } from "@/lib/factory/repository";
import { notFound } from "next/navigation";
export default async function Page({params}:{params:Promise<{id:string}>}){const p=await getProject((await params).id);if(!p)notFound();return <Workspace key={p.id} section="workflows" initial={p} all={await getProjects()}/>;}
