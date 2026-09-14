import { Workspace } from "@/components/factory/workspace";
import { getProjects } from "@/lib/factory/repository";
export default async function Page(){return <Workspace section="settings" all={await getProjects()}/>;}
