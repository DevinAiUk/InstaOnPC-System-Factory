import { NextResponse } from "next/server";
import { getProjects, createProject } from "@/lib/factory/repository";
import { intakeSchema, secretIssues } from "@/lib/factory/validation";
import { body, fail } from "@/lib/factory/http";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({ projects: await getProjects() });
}
export async function POST(req: Request) {
  try {
    const data = await body(req);
    const profile = intakeSchema.parse(data.businessProfile);
    if (secretIssues(JSON.stringify(profile)).length)
      throw new Error("Do not store credentials in the intake.");
    return NextResponse.json(
      { project: await createProject({ businessProfile: profile as any }) },
      { status: 201 },
    );
  } catch (e) {
    return fail(e);
  }
}
