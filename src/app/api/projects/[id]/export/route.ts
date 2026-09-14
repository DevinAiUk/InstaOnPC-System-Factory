import { NextResponse } from "next/server";
import { generateExport } from "@/lib/factory/repository";
import { fail } from "@/lib/factory/http";
export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    return NextResponse.json({
      exportPackage: await generateExport((await params).id),
    });
  } catch (e) {
    return fail(e);
  }
}
