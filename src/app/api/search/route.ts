import { NextResponse } from "next/server";
import { searchWorkspace } from "@/lib/factory/search";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const query = new URL(req.url).searchParams.get("q")?.trim() ?? "";
    if (query.length < 2)
      return NextResponse.json(
        { error: "Use at least two search characters." },
        { status: 400 },
      );
    return NextResponse.json({ results: await searchWorkspace(query) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
