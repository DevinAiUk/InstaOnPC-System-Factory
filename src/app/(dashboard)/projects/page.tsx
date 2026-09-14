import { Workspace } from "@/components/factory/workspace";
import { getProjects } from "@/lib/factory/store";
export default function Page(){return <Workspace section="projects" all={getProjects()}/>;}
