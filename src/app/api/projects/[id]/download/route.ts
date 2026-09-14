import { getProject } from "@/lib/factory/store";
import { packageFiles, zipBundle, csv } from "@/lib/factory/export";
import { fail } from "@/lib/factory/http";
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const p = getProject((await params).id);
    if (!p) throw new Error("Project not found");
    const q = new URL(req.url).searchParams;
    const format = q.get("format") || "zip";
    let data: string | Uint8Array;
    let type: string;
    let ext: string;
    if (format === "zip") {
      data = new Uint8Array(await zipBundle(p));
      type = "application/zip";
      ext = "zip";
    } else if (format === "csv") {
      data = csv([
        ["Asset", "Type", "Owner", "Status", "Next action"],
        ...p.assets.map((a) => [
          a.name,
          a.kind,
          a.owner,
          a.status,
          a.nextAction,
        ]),
      ]);
      type = "text/csv";
      ext = "csv";
    } else if (format === "markdown") {
      data = Object.entries(packageFiles(p))
        .filter(([n]) => n.endsWith(".md"))
        .map(([n, b]) => `\n\n<!-- ${n} -->\n\n${b}`)
        .join("\n\n---\n");
      type = "text/markdown";
      ext = "md";
    } else if (format === "make") {
      data = packageFiles(p)["automation/make-implementation-spec.json"];
      type = "application/json";
      ext = "make-spec.json";
    } else if (format === "json") {
      data = JSON.stringify(p, null, 2);
      type = "application/json";
      ext = "json";
    } else throw new Error("Unknown export format");
    return new Response(data as BodyInit, {
      headers: {
        "Content-Type": type,
        "Content-Disposition": `attachment; filename="${p.id}-delivery.${ext}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return fail(e);
  }
}
