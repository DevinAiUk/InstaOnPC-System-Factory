import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import JSZip from "jszip";
import { createHash } from "node:crypto";
import { score } from "../src/lib/factory/model";
import {
  getProjects,
  createProject,
  getProject,
  mutate,
  regenerate,
  updateProject,
  lockFact,
} from "../src/lib/factory/store";
import { assetIssues, humanize } from "../src/lib/factory/validation";
import { packageFiles, zipBundle, csv } from "../src/lib/factory/export";
import { mockAdapter } from "../src/lib/integrations/adapters";
import { publicIPv4, scanPublicSite } from "../src/lib/factory/scan";
process.env.FACTORY_DATA_PATH = path.join(
  fs.mkdtempSync(path.join(os.tmpdir(), "factory-test-")),
  "workspace.json",
);
const base = getProjects()[0];
test("weighted scoring and input range invariants", () => {
  assert.equal(score([100, 100, 100, 100, 100, 100]), 100);
  assert.equal(score([80, 70, 60, 50, 40, 30]), 59.5);
  assert.throws(() => score([101, 0, 0, 0, 0, 0]));
  assert.throws(() => score([0, 0]));
});
test("three complete demos, eight exact skill modules, ranked alternatives", () => {
  const ps = getProjects();
  assert.equal(ps.length, 3);
  for (const p of ps) {
    assert.equal(p.assets.filter((a) => a.kind === "skill").length, 8);
    assert.equal(p.opportunities!.length, 3);
    assert.ok(p.demo);
    assert.ok(!p.successfulRun);
    assert.ok(
      p.opportunities!.every(
        (o) => o.compositeScore === score(o.dimensions.map((d) => d.score)),
      ),
    );
  }
});
test("new client receives persistent business-specific assets", () => {
  const b = {
    ...base.businessProfile!,
    name: "Test Bay Plumbing",
    city: "Clearwater",
    services: ["Drain cleaning"],
    url: "https://example.com",
  };
  const p = createProject({ businessProfile: b });
  const again = getProject(p.id)!;
  assert.equal(again.assets.length, 23);
  assert.ok(
    again.assets
      .find((a) => a.id === "offer")!
      .body.includes("Test Bay Plumbing"),
  );
  assert.ok(!again.demo);
});
test("locked fact cannot be changed by the persistence API", () => {
  const p = getProject(base.id)!;
  lockFact(p.id, p.factLocks!.find((f) => f.field === "name")!.id);
  assert.throws(
    () =>
      updateProject(p.id, {
        businessProfile: { ...p.businessProfile!, name: "Overwritten" },
      }),
    /Locked fact/,
  );
  assert.equal(getProject(p.id)!.name, p.name);
});
test("single-module regeneration preserves sibling and locked assets", () => {
  mutate(base.id, (p) => {
    p.assets[0].locked = true;
    p.assets[0].body = "LOCKED CUSTOM";
    p.assets[1].body = "UNRELATED CUSTOM";
  });
  regenerate(base.id, "outreach-email");
  const p = getProject(base.id)!;
  assert.equal(p.assets[0].body, "LOCKED CUSTOM");
  assert.equal(p.assets[1].body, "UNRELATED CUSTOM");
  assert.equal(p.assets.find((a) => a.id === "outreach-email")!.version, 2);
  assert.equal(
    p.assets.find((a) => a.id === "outreach-email")!.history.length,
    1,
  );
});
test("approval gate blocks promises, credentials and unmapped workflows", () => {
  const p = getProject(base.id)!;
  const a = { ...p.assets.find((a) => a.kind === "workflow")! };
  const w = JSON.parse(a.body);
  w.fieldMap[0].to = "";
  a.body = JSON.stringify(w);
  assert.ok(assetIssues(p, a).some((x) => x.includes("mapping")));
  a.kind = "offer";
  a.body = "We guarantee 100 leads per month.";
  assert.ok(assetIssues(p, a).some((x) => x.includes("promise")));
  a.body = "token: sk-abcdefghijklmnopqrst";
  assert.ok(assetIssues(p, a).some((x) => x.includes("credentials")));
});
test("content approval requires source linkage; humanization preserves literals", () => {
  const p = getProject(base.id)!;
  const a = p.assets.find((a) => a.kind === "content")!;
  assert.ok(assetIssues(p, a).some((x) => x.includes("source")));
  const text =
    "Utilize is a name. We may utilize 3 items at $500 in Tampa. https://example.com";
  const out = humanize(text);
  assert.ok(
    out.includes("may use 3 items at $500 in Tampa. https://example.com"),
  );
});
test("export ZIP integrity matches every file checksum; CSV formula escaping", async () => {
  const p = getProjects()[1];
  const zip = await JSZip.loadAsync(await zipBundle(p));
  const checks = (await zip.file("SHA256SUMS.txt")!.async("string")).split(
    "\n",
  );
  for (const line of checks) {
    const [hash, name] = line.split("  ");
    const data = await zip.file(name)!.async("nodebuffer");
    assert.equal(createHash("sha256").update(data).digest("hex"), hash);
  }
  assert.equal(
    Object.keys(zip.files).filter((k) => k.endsWith("/SKILL.md")).length,
    8,
  );
  assert.ok(csv([['=HYPERLINK("x")']]).startsWith("\"'="));
  assert.equal(JSON.parse(packageFiles(p)["manifest.json"]).active, false);
});
test("network scanner rejects private addresses and non-HTTPS inputs", async () => {
  for (const ip of [
    "127.0.0.1",
    "10.0.0.1",
    "169.254.169.254",
    "172.16.0.1",
    "192.168.1.1",
    "100.64.0.1",
    "::1",
  ])
    assert.equal(publicIPv4(ip), false);
  assert.equal(publicIPv4("8.8.8.8"), true);
  await assert.rejects(
    () => scanPublicSite("http://127.0.0.1"),
    /public HTTPS/,
  );
});
test("mock adapters never execute side effects", async () => {
  const a = mockAdapter("hubspot");
  const plan = await a.prepare(base);
  assert.equal(plan.executed, false);
  await assert.rejects(() => a.execute(plan), /cannot write externally/);
});
