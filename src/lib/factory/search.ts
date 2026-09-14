import { neon } from "@neondatabase/serverless";

export interface SearchResult {
  id: string;
  projectId: string;
  sourceType: "project" | "source" | "asset";
  sourceId: string;
  title: string;
  excerpt: string;
  score: number;
  metadata: Record<string, unknown>;
}

function database() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Database search is not configured.");
  return neon(url);
}

export async function searchWorkspace(
  query: string,
  organizationId = "single-operator",
  limit = 20,
): Promise<SearchResult[]> {
  const q = query.trim().slice(0, 500);
  if (!q) return [];
  const take = Math.max(1, Math.min(limit, 50));
  if (!process.env.DATABASE_URL) {
    const {getProjects}=await import('./repository');
    const results:SearchResult[]=[];
    for(const p of await getProjects()) {
      const entries=[{id:p.id,title:p.name,text:JSON.stringify(p.businessProfile),type:'project' as const},...p.sources.map(s=>({id:s.id,title:s.title,text:s.text,type:'source' as const})),...p.assets.map(a=>({id:a.id,title:a.name,text:a.body,type:'asset' as const}))];
      for(const e of entries) if((e.title+' '+e.text).toLowerCase().includes(q.toLowerCase()))results.push({id:p.id+':'+e.id,projectId:p.id,sourceId:e.id,sourceType:e.type,title:e.title,excerpt:e.text.slice(0,320),score:1,metadata:{method:'literal-match'}});
    }
    return results.slice(0,take);
  }
  const sql = database();
  const rows = await sql`
    SELECT id,
           project_id AS "projectId",
           source_type AS "sourceType",
           source_id AS "sourceId",
           title,
           left(content, 320) AS excerpt,
           search_tsv <@> to_bm25query(
             to_tsvector('english', ${q}),
             'search_documents_bm25'
           ) AS score,
           metadata
      FROM search_documents
     WHERE organization_id = ${organizationId}
     ORDER BY score ASC, id ASC
     LIMIT ${take}
  `;
  return rows as SearchResult[];
}
