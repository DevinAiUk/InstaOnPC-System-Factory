import { NextResponse } from "next/server";
import {
  approveOffer,
  rejectOffer,
  lockFact,
  unlockFact,
} from "@/lib/factory/repository";
import { body, fail } from "@/lib/factory/http";
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const d = await body(req);
    let success = false;
    if (d.action === "approve") success = await approveOffer(id);
    else if (d.action === "reject")
      success = await rejectOffer(id, String(d.reason || ""));
    else if (d.action === "lock") success = await lockFact(id, String(d.factId));
    else if (d.action === "unlock") success = await unlockFact(id, String(d.factId));
    else throw new Error("Unknown approval action");
    return NextResponse.json({ success });
  } catch (e) {
    return fail(e);
  }
}
