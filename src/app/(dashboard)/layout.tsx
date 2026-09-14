import { Shell } from "@/components/factory/shell";
import { getProjects } from "@/lib/factory/store";
export const dynamic="force-dynamic";
export default function Layout({children}:{children:React.ReactNode}){return <Shell projects={getProjects()}>{children}</Shell>;}
