import { Workspace } from "@/components/factory/workspace";
import { getProject,getProjects } from "@/lib/factory/store";
import { notFound } from "next/navigation";
export default async function Page({params}:{params:Promise<{id:string}>}){const p=getProject((await params).id);if(!p)notFound();return <Workspace key={p.id} section="roadmap" initial={p} all={getProjects()}/>;}
