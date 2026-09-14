import { NextResponse } from "next/server";
import { generateAnalysis } from "@/lib/factory/repository";
import { fail } from "@/lib/factory/http";
export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    return NextResponse.json({
      profile: await generateAnalysis((await params).id),
    });
  } catch (e) {
    return fail(e);
  }
}
