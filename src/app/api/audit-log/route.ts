import { NextResponse } from "next/server";
import { getAuditLog } from "@/lib/mock-data/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") ?? undefined;
  const log = getAuditLog(projectId);
  return NextResponse.json({ log });
}
