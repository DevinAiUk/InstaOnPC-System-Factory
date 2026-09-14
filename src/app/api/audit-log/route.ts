import { NextResponse } from "next/server";
import { getAuditLog } from "@/lib/factory/repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") ?? undefined;
  const log = await getAuditLog(projectId);
  return NextResponse.json({ log });
}
