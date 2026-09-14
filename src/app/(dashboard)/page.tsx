import { Workspace } from "@/components/factory/workspace";
import { getProjects } from "@/lib/factory/repository";
export default async function Page(){return <Workspace section="dashboard" all={await getProjects()}/>;}
