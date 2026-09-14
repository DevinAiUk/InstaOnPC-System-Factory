import { NextResponse } from "next/server";
import { getProject, updateProject, deleteProject } from "@/lib/factory/repository";
import { intakeSchema, secretIssues } from "@/lib/factory/validation";
import { body, fail } from "@/lib/factory/http";
type Context = { params: Promise<{ id: string }> };
export async function GET(_: Request, { params }: Context) {
  const p = await getProject((await params).id);
  return p
    ? NextResponse.json({ project: p })
    : NextResponse.json({ error: "Project not found" }, { status: 404 });
}
export async function PUT(req: Request, { params }: Context) {
  try {
    const data = await body(req);
    if (secretIssues(JSON.stringify(data)).length)
      throw new Error("Remove credentials.");
    if (data.businessProfile)
      data.businessProfile = intakeSchema.parse(data.businessProfile);
    return NextResponse.json({
      project: await updateProject((await params).id, data),
    });
  } catch (e) {
    return fail(e);
  }
}
export async function DELETE(_: Request, { params }: Context) {
  return NextResponse.json({ success: await deleteProject((await params).id) });
}
