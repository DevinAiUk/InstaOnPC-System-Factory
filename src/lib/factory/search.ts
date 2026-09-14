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
