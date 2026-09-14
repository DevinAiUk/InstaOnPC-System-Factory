import { NextResponse } from "next/server";
export async function body(req: Request) {
  const raw = await req.text();
  if (raw.length > 200000) throw new Error("Request too large");
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON");
  }
}
export function fail(e: unknown) {
  const message = e instanceof Error ? e.message : "Request failed";
  return NextResponse.json(
    { error: message },
    {
      status:
        message === "Project not found"
          ? 404
          : message.includes("version") || message.includes("Locked")
            ? 409
            : 400,
    },
  );
}
