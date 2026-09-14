import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getProject, mutate } from "@/lib/factory/repository";
import { scanPublicSite } from "@/lib/factory/scan";
import { fail } from "@/lib/factory/http";
export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const p = await getProject(id);
    if (!p) throw new Error("Project not found");
    if (p.demo)
      throw new Error(
        "Demo domains are fictional. Create a client project for scanning.",
      );
    const source = await scanPublicSite(p.businessProfile!.url);
    const project = await mutate(
      id,
      (p) => {
        if (
          p.sources.some((s) => s.url === source.url && s.text === source.text)
        )
          throw new Error("This exact page is already in the source ledger.");
        p.sources.push({
          ...source,
          id: randomUUID(),
          label: "sourced",
          approved: false,
          capturedAt: new Date().toISOString(),
        });
      },
      "Captured public HTML page for review",
    );
    return NextResponse.json({ project });
  } catch (e) {
    return fail(e);
  }
}
