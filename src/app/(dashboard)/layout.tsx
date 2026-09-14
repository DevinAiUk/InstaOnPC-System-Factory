import { Shell } from "@/components/factory/shell";
import { getProjects } from "@/lib/factory/repository";
export const dynamic="force-dynamic";
export default async function Layout({children}:{children:React.ReactNode}){return <Shell projects={await getProjects()}>{children}</Shell>;}
