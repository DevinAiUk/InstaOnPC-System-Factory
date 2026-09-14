"use client";
import { OpportunityRadar } from "@/components/campaign/opportunity-radar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  Search,
  FolderOpen,
  Check,
  ChevronRight,
  RefreshCw,
  Lock,
  Unlock,
  ScanLine,
  Download,
  ShieldCheck,
  Clock,
  Target,
  BookOpen,
  Workflow,
  FileText,
  Mail,
  Boxes,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  SlidersHorizontal,
  Printer,
  ChartColumn,
  Layers,
} from "lucide-react";
import type { FactoryProject, FactoryAsset } from "@/lib/factory/model";
import { completion } from "@/lib/factory/model";
import { assetIssues } from "@/lib/factory/validation";
import { Editor } from "./editor";
import { Intake } from "./intake";
const TITLES: Record<string, [string, string]> = {
  intelligence: [
    "Business intelligence",
    "Build the evidence before you build the system.",
  ],
  audit: [
    "Revenue-leak audit",
    "Trace the customer journey and find the friction.",
  ],
  opportunities: [
    "Opportunity board",
    "Choose a useful outcome, backed by a clear rationale.",
  ],
  offer: ["Offer builder", "A focused scope your client can understand."],
  system: [
    "System builder",
    "One business outcome. A connected set of working parts.",
  ],
  skills: ["Skill studio", "Eight reusable skills, tailored to this business."],
  workflows: ["Workflow studio", "From first inquiry to a reviewed handoff."],
  outreach: [
    "Outreach studio",
    "A relevant observation. A practical idea. A calm invitation.",
  ],
  content: ["Content studio", "Approved sources into useful, natural content."],
  visibility: [
    "Local visibility",
    "Service answers and conversion paths worth improving.",
  ],
  roadmap: ["Launch hub", "A 90-day plan with clear ownership."],
  reporting: [
    "Reporting hub",
    "Measure what changed. Be clear about what did not.",
  ],
  export: ["Export center", "Package your work for a clean client handoff."],
};
const ICONS = {
  skill: BookOpen,
  offer: FileText,
  workflow: Workflow,
  outreach: Mail,
  content: FileText,
  sop: Boxes,
  report: ChartColumn,
};
export function Workspace({
  section,
  initial,
  all,
}: {
  section: string;
  initial?: FactoryProject;
  all: FactoryProject[];
}) {
  const [p, setP] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState("");
  const [drawer, setDrawer] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [result, setResult] = useState({
    metric: "Qualified inquiries",
    baseline: "",
    current: "",
    unit: "inquiries",
    period: "",
    source: "",
  });
  const [ack, setAck] = useState(false);
  const router = useRouter();
  async function act(data: Record<string, unknown>) {
    if (!p) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const r = await fetch(`/api/projects/${p.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, revision: p.revision }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setP(d.project);
      setMessage(
        data.action === "approve"
          ? "Draft approved. No external action was performed."
          : "Workspace saved.",
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }
  async function scan() {
    if (!p) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/projects/${p.id}/scan`, { method: "POST" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setP(d.project);
      setMessage("Page captured. Review the source before approving it.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed.");
    } finally {
      setBusy(false);
    }
  }
  const path = (key = "") => `/projects/${p?.id}${key ? "/" + key : ""}`;
  if (section === "new" || section === "intake")
    return <Intake project={section === "intake" ? p : undefined} />;
  const title =
    section === "dashboard"
      ? "Your system factory."
      : section === "projects"
        ? "Projects"
        : section === "settings"
          ? "Workspace settings"
          : section === "overview"
            ? p?.name
            : TITLES[section]?.[0];
  const description =
    section === "dashboard"
      ? "Turn a business challenge into a system ready for client review."
      : section === "projects"
        ? "Every business, its next step, and the work behind it."
        : section === "overview"
          ? `${p?.businessProfile?.industry} · ${p?.businessProfile?.city}`
          : TITLES[section]?.[1];
  const filtered = all.filter(
    (p) =>
      (
        p.name +
        " " +
        p.businessProfile?.city +
        " " +
        p.businessProfile?.industry
      )
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "all" ||
        (filter === "demo" && p.demo) ||
        (filter === "client" && !p.demo)),
  );
  const filteredAssets =
    p?.assets.filter(
      (a) =>
        (section === "skills"
          ? a.kind === "skill"
          : section === "offer"
            ? a.kind === "offer"
            : section === "workflows"
              ? a.kind === "workflow"
              : section === "outreach"
                ? a.kind === "outreach"
                : section === "content" || section === "visibility"
                  ? a.kind === "content"
                  : section === "reporting"
                    ? a.kind === "report"
                    : true) &&
        (!query ||
          (a.name + " " + a.body).toLowerCase().includes(query.toLowerCase())),
    ) || [];
  const chosen =
    filteredAssets.find((a) => a.id === selected) || filteredAssets[0];
  const approved = p?.assets.filter((a) => a.status === "approved").length || 0;
  const showStudio = [
    "skills",
    "offer",
    "workflows",
    "outreach",
    "content",
    "visibility",
  ].includes(section);
  return (
    <div className="page-enter">
      <div className="page-title-row">
        <div>
          <div className="eyebrow">
            {p
              ? "LOCAL LEAD ENGINE"
              : section === "settings"
                ? "CONFIGURATION"
                : "INSTAONPC / WORKSPACE"}
          </div>
          <h1>{title}</h1>
          <p className="page-description">{description}</p>
        </div>
        {["dashboard", "projects"].includes(section) ? (
          <Link className="button primary" href="/projects/new">
            <Plus size={17} />
            New project
          </Link>
        ) : p && section !== "export" ? (
          <Link className="button" href={path("export")}>
            <Download size={16} />
            Export package
          </Link>
        ) : null}
      </div>
      {message && (
        <div className="feedback success" role="status">
          <CheckCircle2 size={17} />
          {message}
          <button aria-label="Dismiss message" onClick={() => setMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {error && (
        <div className="feedback error" role="alert">
          <AlertCircle size={17} />
          {error}
          <button aria-label="Dismiss error" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {["dashboard", "projects"].includes(section) && (
        <>
          {section === "dashboard" && (
            <>
              <div className="stats-grid">
                <Stat
                  title="Active projects"
                  value={all.length}
                  note={`${all.filter((p) => !p.demo).length} client · ${all.filter((p) => p.demo).length} demo`}
                  icon={<FolderOpen size={19} />}
                />
                <Stat
                  title="Assets prepared"
                  value={all.reduce((s, p) => s + p.assets.length, 0)}
                  note="Editable drafts across your projects"
                  icon={<Layers size={19} />}
                />
                <Stat
                  title="Ready for review"
                  value={all.reduce(
                    (s, p) =>
                      s + p.assets.filter((a) => a.status === "draft").length,
                    0,
                  )}
                  note="Your review is the next step"
                  icon={<CheckCircle2 size={19} />}
                />
                <Stat
                  title="Verified client runs"
                  value={`${all.filter((p) => p.successfulRun && !p.demo).length} / 3`}
                  note="Required before template expansion"
                  icon={<Target size={19} />}
                />
              </div>
              <div className="dashboard-band">
                <div className="band-copy">
                  <span className="small-label">
                    YOUR DEFAULT DELIVERY SYSTEM
                  </span>
                  <h2>AI front desk + Local Lead Engine</h2>
                  <p>
                    Capture the inquiry. Answer the right questions. Get it to
                    the right person.
                  </p>
                  <div className="band-tags">
                    <span>Local services</span>
                    <span>Appointments</span>
                    <span>Tampa Bay</span>
                  </div>
                </div>
                <div className="band-route">
                  <div>
                    <ScanLine size={18} />
                    <span>Research</span>
                  </div>
                  <ChevronRight size={17} />
                  <div>
                    <Boxes size={18} />
                    <span>Build</span>
                  </div>
                  <ChevronRight size={17} />
                  <div>
                    <ShieldCheck size={18} />
                    <span>Review</span>
                  </div>
                  <ChevronRight size={17} />
                  <div>
                    <Download size={18} />
                    <span>Deliver</span>
                  </div>
                </div>
              </div>
            </>
          )}
          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>
                  {section === "dashboard"
                    ? "Project pipeline"
                    : "All projects"}{" "}
                  <span className="count-label">{filtered.length}</span>
                </h2>
                <p>Pick a project to continue where you left off.</p>
              </div>
              <div className="table-controls">
                <div className="search-field">
                  <Search size={16} />
                  <input
                    aria-label="Search projects"
                    placeholder="Search projects…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <select
                  aria-label="Filter projects"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All projects</option>
                  <option value="demo">Demo projects</option>
                  <option value="client">Client projects</option>
                </select>
              </div>
            </div>
            <div className="table-scroll">
              <table className="project-table">
                <thead>
                  <tr>
                    <th>BUSINESS</th>
                    <th>STAGE</th>
                    <th>COMPLETION</th>
                    <th>NEXT ACTION</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((x, i) => (
                    <tr key={x.id}>
                      <td>
                        <Link
                          className="business-cell"
                          href={`/projects/${x.id}`}
                        >
                          <span className={`business-icon variant-${i % 3}`}>
                            {i % 3 === 0 ? (
                              <Boxes size={21} />
                            ) : i % 3 === 1 ? (
                              <Target size={21} />
                            ) : (
                              <FileText size={21} />
                            )}
                          </span>
                          <span>
                            <b>{x.name}</b>
                            <small>
                              {x.businessProfile?.industry} ·{" "}
                              {x.businessProfile?.city}
                              {x.demo ? " · Demo" : ""}
                            </small>
                          </span>
                        </Link>
                      </td>
                      <td>
                        <span className="stage-badge">{x.status}</span>
                      </td>
                      <td>
                        <div className="progress-cell">
                          <div className="progress-track">
                            <span style={{ width: completion(x) + "%" }} />
                          </div>
                          <span>{completion(x)}%</span>
                        </div>
                      </td>
                      <td>
                        <Link
                          className="next-link"
                          href={`/projects/${x.id}/${x.sources.some((s) => s.approved) ? "skills" : "intelligence"}`}
                        >
                          {x.sources.some((s) => s.approved)
                            ? "Review generated skills"
                            : "Confirm business evidence"}
                          <ArrowUpRight size={14} />
                        </Link>
                      </td>
                      <td>
                        <Link
                          aria-label={`Open ${x.name}`}
                          className="icon-btn"
                          href={`/projects/${x.id}`}
                        >
                          <ArrowRight size={17} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <Empty
                  title="No projects found"
                  text="Try a different search, or create your first client project."
                />
              )}
            </div>
          </section>
          {section === "dashboard" && (
            <div className="two-column dashboard-bottom">
              <section className="panel">
                <div className="section-heading">
                  <h2>A focused first release</h2>
                  <span className="status approved">MVP</span>
                </div>
                <div className="padded">
                  <p>
                    Build and manually validate three Local Lead Engines before
                    adding new delivery templates.
                  </p>
                  <div className="deferred-list">
                    {[
                      "E-commerce conversion",
                      "Authority-to-appointment",
                      "Operations automation",
                    ].map((s) => (
                      <div key={s}>
                        <Lock size={15} />
                        <span>{s}</span>
                        <small>Deferred</small>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
              <section className="panel">
                <div className="section-heading">
                  <h2>Built around your review</h2>
                  <ShieldCheck size={19} />
                </div>
                <div className="padded">
                  <p>Drafts keep assumptions visible and facts traceable.</p>
                  <div className="principle-list">
                    <span>
                      <Check size={16} />
                      Evidence labels and fact locks
                    </span>
                    <span>
                      <Check size={16} />
                      One-module regeneration
                    </span>
                    <span>
                      <Check size={16} />
                      No automatic outreach or activation
                    </span>
                  </div>
                </div>
              </section>
            </div>
          )}
        </>
      )}
      {section === "settings" && (
        <>
          <section className="panel">
            <div className="section-heading">
              <h2>Integration adapters</h2>
              <span className="status draft">Mock mode</span>
            </div>
            <div className="integration-grid">
              {[
                "HubSpot",
                "Google Drive",
                "Google Docs",
                "Notion",
                "Make",
                "n8n",
                "Zapier",
              ].map((name) => (
                <div className="integration-card" key={name}>
                  <span className="integration-monogram">{name[0]}</span>
                  <h3>{name}</h3>
                  <span className="status draft">Not connected in app</span>
                  <p>
                    Prepare a reviewed payload. Configure credentials on the
                    server through a managed connection.
                  </p>
                </div>
              ))}
            </div>
          </section>
          <div className="notice">
            The ChatGPT connectors and this application have separate
            authorization. Selecting an integration does not connect an account.
            Live delivery requires server configuration and explicit approval.
          </div>
          <section className="panel padded">
            <h2>Workspace storage & access</h2>
            <p>
              Single-operator workspace with persistent local JSON storage.
              Configure a private access password and durable disk before
              hosting. A normalized PostgreSQL schema is included for the
              multi-user integration phase.
            </p>
          </section>
        </>
      )}
      {p && section === "overview" && (
        <>
          <div className="project-summary">
            <div>
              <span className="status draft">
                {p.demo ? "Fictional demo project" : "Client project"}
              </span>
              <h2>{p.businessProfile?.primaryGoal}</h2>
              <p>
                {p.businessProfile?.painPoints ||
                  "Confirm the business bottleneck during intake."}
              </p>
              <div className="button-row">
                <Link className="button primary" href={path("intelligence")}>
                  Review business evidence
                  <ArrowRight size={16} />
                </Link>
                <Link className="button" href={path("intake")}>
                  Edit intake
                </Link>
              </div>
            </div>
            <div className="large-score">
              <span>
                {completion(p)}
                <small>%</small>
              </span>
              <p>Delivery readiness</p>
              <div className="progress-track">
                <span style={{ width: completion(p) + "%" }} />
              </div>
            </div>
          </div>
          <div className="stats-grid three">
            <Stat
              title="Recommended opportunity"
              value={p.opportunities?.[0].compositeScore || 0}
              note="Weighted score / 100"
              icon={<Target size={19} />}
            />
            <Stat
              title="Approved assets"
              value={`${approved} / ${p.assets.length}`}
              note="Review each draft before delivery"
              icon={<ShieldCheck size={19} />}
            />
            <Stat
              title="Approved sources"
              value={p.sources.filter((s) => s.approved).length}
              note="Evidence quality starts here"
              icon={<ScanLine size={19} />}
            />
          </div>
          <div className="module-grid">
            {[
              [
                "opportunities",
                "Choose your solution",
                "Review three ranked opportunities.",
                Target,
              ],
              [
                "system",
                "Build the system",
                "Tailored assets and architecture.",
                Boxes,
              ],
              [
                "skills",
                "Refine eight skills",
                "Edit, approve, lock and version.",
                BookOpen,
              ],
              [
                "workflows",
                "Review the workflow",
                "Field maps, fallbacks and test cases.",
                Workflow,
              ],
              [
                "outreach",
                "Start the conversation",
                "Calm, business-specific drafts.",
                Mail,
              ],
              [
                "export",
                "Prepare the handoff",
                "Seven folders, one delivery package.",
                Download,
              ],
            ].map(([key, name, desc, Icon]) => {
              const I = Icon as typeof Target;
              return (
                <Link
                  key={String(key)}
                  className="module-card"
                  href={path(String(key))}
                >
                  <I size={22} />
                  <h3>{String(name)}</h3>
                  <p>{String(desc)}</p>
                  <ArrowUpRight size={17} />
                </Link>
              );
            })}
          </div>
        </>
      )}
      {p && section === "intelligence" && (
        <>
          <div className="two-column">
            <section className="panel padded">
              <div className="section-heading bare">
                <h2>Business profile</h2>
                <Link href={path("intake")} className="text-link">
                  Edit intake
                  <ArrowUpRight size={14} />
                </Link>
              </div>
              <h3>{p.name}</h3>
              <p>{p.businessProfile?.services.join(" · ")}</p>
              <dl className="definition-grid">
                <dt>Location</dt>
                <dd>{p.businessProfile?.city}</dd>
                <dt>Goal</dt>
                <dd>{p.businessProfile?.primaryGoal}</dd>
                <dt>Website</dt>
                <dd>{p.businessProfile?.url || "Needs review"}</dd>
                <dt>CRM</dt>
                <dd>{p.businessProfile?.crm || "Needs review"}</dd>
                <dt>Booking</dt>
                <dd>{p.businessProfile?.bookingTool || "Needs review"}</dd>
              </dl>
              <button
                className="button"
                disabled={busy || p.demo || !p.businessProfile?.url}
                onClick={scan}
              >
                <ScanLine size={16} />
                {busy ? "Scanning…" : "Scan public website"}
              </button>
              <p className="small-note">
                {p.demo
                  ? "Demo domains are fictional. Create a client project to scan a real site."
                  : "Captures a single public HTML page. Redirects, private addresses and oversized pages are rejected."}
              </p>
            </section>
            <section className="panel padded">
              <h2>Fact locks</h2>
              <p>Locked fields cannot be overwritten by intake edits.</p>
              <div className="fact-list">
                {p.factLocks?.map((f) => (
                  <div key={f.id}>
                    <span>
                      <b>{f.field}</b>
                      <small>
                        {String(
                          p.businessProfile?.[
                            f.field as keyof typeof p.businessProfile
                          ] || "Needs review",
                        )}
                      </small>
                    </span>
                    <button
                      className="icon-btn"
                      disabled={busy}
                      aria-label={`${f.locked ? "Unlock" : "Lock"} ${f.field}`}
                      onClick={() => act({ action: "fact", factId: f.id })}
                    >
                      {f.locked ? <Lock size={17} /> : <Unlock size={17} />}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>Source ledger</h2>
                <p>
                  Review the exact source before it can support generated
                  content.
                </p>
              </div>
              <span className="count-label">{p.sources.length} sources</span>
            </div>
            {p.sources.map((s) => (
              <div className="source-row" key={s.id}>
                <div>
                  <div className="button-row">
                    <b>{s.title}</b>
                    <span className="status draft">{s.label}</span>
                    {s.approved && (
                      <span className="status approved">approved</span>
                    )}
                  </div>
                  <p>{s.text}</p>
                  {s.url && (
                    <a
                      className="text-link"
                      target="_blank"
                      rel="noreferrer"
                      href={s.url}
                    >
                      View source
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
                <button
                  className="button"
                  disabled={busy}
                  onClick={() => act({ action: "source", sourceId: s.id })}
                >
                  {s.approved ? "Revoke approval" : "Approve source"}
                </button>
              </div>
            ))}
            <div className="padded source-form">
              <label>
                Additional source or approved business facts
                <textarea
                  rows={3}
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Paste exact facts or approved source material…"
                />
              </label>
              <label>
                Source URL (optional)
                <input
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://…"
                />
              </label>
              <button
                className="button"
                disabled={busy || !sourceText.trim()}
                onClick={() =>
                  act({
                    action: "add-source",
                    text: sourceText,
                    url: sourceUrl,
                  })
                }
              >
                <Plus size={15} />
                Add source for review
              </button>
            </div>
          </section>
          <div className="notice">
            After approving a source, regenerate affected content in its studio
            to update the evidence references.
          </div>
        </>
      )}
      {p && section === "audit" && (
        <>
          <div className="journey-strip">
            {["Discover", "Inquire", "Respond", "Qualify", "Hand off"].map(
              (s, i) => (
                <div key={s}>
                  <span>0{i + 1}</span>
                  <b>{s}</b>
                </div>
              ),
            )}
          </div>
          <div className="module-grid">
            {(p.revenueLeaks?.length
              ? p.revenueLeaks
              : [
                  {
                    id: "new",
                    category: "response",
                    observation:
                      p.businessProfile?.painPoints ||
                      "Confirm the inquiry response process.",
                    evidenceLabel: "user-provided",
                    recommendedAction:
                      "Trace one inquiry from arrival to owner.",
                    requiredHumanInput: "Confirm response times and baseline.",
                    severity: "high",
                    evidence: "Intake only; not independently verified.",
                  },
                ]
            ).map((l) => (
              <section className="panel padded" key={l.id}>
                <div className="button-row">
                  <span className="eyebrow">{l.category}</span>
                  <span className="status draft">{l.severity} priority</span>
                </div>
                <h3>{l.observation}</h3>
                <p>{l.evidence}</p>
                <span className="status draft">{l.evidenceLabel}</span>
                <h4>Recommended action</h4>
                <p>{l.recommendedAction}</p>
                <h4>Human review</h4>
                <p>{l.requiredHumanInput}</p>
              </section>
            ))}
          </div>
          <Link className="button primary" href={path("opportunities")}>
            Compare recommended solutions
            <ArrowRight size={16} />
          </Link>
        </>
      )}
      {p && section === "opportunities" && (
        <>
          <div className="formula-bar">
            <span>OPPORTUNITY SCORE</span>
            <code>0.25U + 0.20V + 0.15F + 0.15A + 0.15D + 0.10E</code>
            <small>Suggestions, not guaranteed outcomes</small>
          </div>
          <div className="opportunity-list">
            {p.opportunities?.map((o) => (
              <section
                className={`opportunity-card ${p.selectedOpportunityId === o.id ? "chosen" : ""}`}
                key={o.id}
              >
                <div className="opportunity-score">
                  <b>{o.compositeScore}</b>
                  <span>OUT OF 100</span>
                </div>
                <div className="opportunity-main">
                  <div className="button-row">
                    <span className="eyebrow">RANK {o.rank}</span>
                    {p.selectedOpportunityId === o.id && (
                      <span className="status approved">Selected package</span>
                    )}
                    <span className="status draft">
                      {o.complexity} complexity
                    </span>
                  </div>
                  <h2>{o.name}</h2>
                  <p>{o.problem}</p>
                  <OpportunityRadar dimensions={o.dimensions}/>
                  <div className="dimension-bars">
                    {o.dimensions.map((d) => (
                      <div key={d.name}>
                        <span>{d.name}</span>
                        <div className="progress-track">
                          <span style={{ width: d.score + "%" }} />
                        </div>
                        <b>{d.score}</b>
                      </div>
                    ))}
                  </div>
                  <div className="button-row">
                    <button className="button" onClick={() => setDrawer(o.id)}>
                      Reasoning & assumptions
                      <ArrowUpRight size={15} />
                    </button>
                    <button
                      className="button primary"
                      disabled={busy || p.selectedOpportunityId === o.id}
                      onClick={() =>
                        act({ action: "select", opportunityId: o.id })
                      }
                    >
                      {p.selectedOpportunityId === o.id
                        ? "Selected"
                        : "Choose solution"}
                    </button>
                  </div>
                </div>
              </section>
            ))}
          </div>
          {drawer && (
            <dialog
              open
              className="decision-dialog"
              aria-label="Recommendation explanation"
            >
              <div className="dialog-heading">
                <h2>Why this solution?</h2>
                <button
                  aria-label="Close explanation"
                  className="icon-btn"
                  onClick={() => setDrawer("")}
                >
                  <X />
                </button>
              </div>
              {p.opportunities
                ?.filter((o) => o.id === drawer)
                .map((o) => (
                  <div key={o.id}>
                    <h3>{o.name}</h3>
                    <p>{o.whySelected}</p>
                    {[
                      ["Required inputs", o.requiredInputs],
                      ["Risks & dependencies", [...o.risks, ...o.dependencies]],
                      ["Human review", o.humanReviewPoints],
                    ].map(([label, items]) => (
                      <div key={String(label)}>
                        <h4>{String(label)}</h4>
                        <ul>
                          {(items as string[]).map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <h4>Measurement</h4>
                    <p>{o.measurementDefinition}</p>
                    <h4>First action</h4>
                    <p>{o.suggestedFirstAction}</p>
                    <h4>Adjust scoring assumptions</h4>
                    <div className="score-inputs">
                      {o.dimensions.map((d, i) => (
                        <label key={d.name}>
                          {d.name}
                          <input
                            aria-label={`${d.name} score`}
                            type="number"
                            min="0"
                            max="100"
                            defaultValue={d.score}
                            onBlur={(e) => {
                              const values = o.dimensions.map((d) => d.score);
                              values[i] = Number(e.target.value);
                              if (values[i] !== o.dimensions[i].score)
                                act({
                                  action: "score",
                                  opportunityId: o.id,
                                  values,
                                });
                            }}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
            </dialog>
          )}
        </>
      )}
      {p && section === "system" && (
        <>
          <section className="architecture">
            <div className="architecture-title">
              <span className="eyebrow">SELECTED SYSTEM</span>
              <h2>
                {
                  p.opportunities?.find((o) => o.id === p.selectedOpportunityId)
                    ?.name
                }
              </h2>
              <p>
                Website intake → approved answers → human review → prepared
                handoff
              </p>
            </div>
            <div className="architecture-parts">
              {[
                ["01", "Local visibility", "GBP hygiene · visible-page schema · NAP"],
                ["02", "Supervised AI front desk", "AI disclosure · intake · deterministic escalation"],
                ["03", "CRM follow-up", "Owner routing · SLA targets · approved reminders"],
              ].map(([n, t, s]) => (
                <div key={n}>
                  <span>{n}</span>
                  <h3>{t}</h3>
                  <p>{s}</p>
                </div>
              ))}
            </div>
          </section>
          <div className="section-heading bare">
            <div>
              <h2>Factory assets</h2>
              <p>
                {p.assets.length} modules · {approved} approved · Regenerate
                individual drafts to preserve other work.
              </p>
            </div>
            <button
              className="button"
              disabled={busy}
              onClick={() => act({ action: "regenerate" })}
            >
              <RefreshCw size={16} />
              Regenerate unlocked modules
            </button>
          </div>
          <div className="module-grid">
            {p.assets.map((a) => {
              const I = ICONS[a.kind];
              return (
                <button
                  className="module-card text-left"
                  key={a.id}
                  onClick={() => setSelected(a.id)}
                >
                  <I size={22} />
                  <span className={`status ${a.status}`}>{a.status}</span>
                  <h3>{a.name}</h3>
                  <p>
                    {a.owner} · Version {a.version}
                    {a.locked ? " · Locked" : ""}
                  </p>
                </button>
              );
            })}
          </div>
          {selected && (
            <Editor
              key={
                p.assets.find((a) => a.id === selected)!.id +
                "-" +
                p.assets.find((a) => a.id === selected)!.version +
                "-" +
                p.revision
              }
              project={p}
              asset={p.assets.find((a) => a.id === selected)!}
              act={act}
              busy={busy}
            />
          )}
          <section className="panel padded">
            <h2>Planned integrations</h2>
            <div className="integration-choices">
              {[
                "Make",
                "HubSpot",
                "Google Drive",
                "Google Docs",
                "Notion",
                "n8n",
                "Zapier",
              ].map((s) => (
                <label key={s}>
                  <input
                    type="checkbox"
                    checked={p.integrations.includes(s)}
                    disabled={busy}
                    onChange={() =>
                      act({
                        action: "settings",
                        integrations: p.integrations.includes(s)
                          ? p.integrations.filter((x) => x !== s)
                          : [...p.integrations, s],
                      })
                    }
                  />
                  {s}
                  <span className="status draft">Mock</span>
                </label>
              ))}
            </div>
          </section>
        </>
      )}
      {p && showStudio && (
        <>
          {section === "workflows" && (
            <>
              <div className="workflow-diagram">
                <div className="workflow-node">
                  <ScanLine size={20} />
                  <b>Signed intake</b>
                  <small>Schema + consent</small>
                </div>
                <ArrowRight />
                <div className="workflow-node">
                  <ShieldCheck size={20} />
                  <b>Validate & dedupe</b>
                  <small>Reject invalid requests</small>
                </div>
                <ArrowRight />
                <div className="workflow-node">
                  <BookOpen size={20} />
                  <b>Approved knowledge</b>
                  <small>Uncertainty → human</small>
                </div>
                <ArrowRight />
                <div className="workflow-node">
                  <CheckCircle2 size={20} />
                  <b>Review handoff</b>
                  <small>No live writes</small>
                </div>
              </div>
              <div className="notice">
                Implementation specification. Native Make module IDs and
                connections require validation before import. This workflow is
                inactive.
              </div>
            </>
          )}
          {section === "outreach" && (
            <div className="two-column">
              <section className="panel padded">
                <h3>Prospect criteria</h3>
                <p>
                  {p.businessProfile?.industry} businesses in{" "}
                  {p.businessProfile?.serviceArea || p.businessProfile?.city},
                  with an owner-confirmed need around{" "}
                  {p.businessProfile?.primaryGoal.toLowerCase()}.
                </p>
                <p className="small-note">
                  Use verified buying signals. A missing social URL does not
                  mean the business has no account. Review scores are not
                  website scores.
                </p>
              </section>
              <section className="panel padded">
                <label>
                  Voice
                  <select
                    value={p.voice}
                    disabled={busy}
                    onChange={(e) =>
                      act({ action: "settings", voice: e.target.value })
                    }
                  >
                    {[
                      "Calm & consultative",
                      "Warm & personable",
                      "Concise & direct",
                    ].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <p className="small-note">
                  Select a voice, then regenerate the message. One or two
                  relevant services, one calm CTA. Nothing is sent.
                </p>
              </section>
            </div>
          )}
          {["content", "visibility"].includes(section) && (
            <div className="notice">
              {p.sources.filter((s) => s.approved).length} approved sources ·
              Source references travel with every content atom. Humanization
              preserves factual values and qualifiers.{" "}
              <Link className="text-link" href={path("intelligence")}>
                Manage sources
              </Link>
            </div>
          )}
          <div className="studio-layout">
            <aside className="asset-list">
              <div className="search-field">
                <Search size={16} />
                <input
                  aria-label="Search assets"
                  placeholder="Find an asset…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              {filteredAssets.map((a) => (
                <button
                  className={
                    chosen?.id === a.id ? "asset-item selected" : "asset-item"
                  }
                  key={a.id}
                  onClick={() => setSelected(a.id)}
                >
                  <span className="asset-number">
                    {a.kind === "skill" ? (
                      a.id.slice(0, 2)
                    ) : (
                      <FileText size={17} />
                    )}
                  </span>
                  <span>
                    <b>{a.name}</b>
                    <small>
                      v{a.version} · {a.status}
                      {a.locked ? " · Locked" : ""}
                    </small>
                  </span>
                </button>
              ))}
            </aside>
            {chosen ? (
              <Editor
                key={chosen.id + "-" + chosen.version + "-" + p.revision}
                asset={chosen}
                project={p}
                act={act}
                busy={busy}
              />
            ) : (
              <Empty title="No matching assets" text="Try another search." />
            )}
          </div>
        </>
      )}
      {p && section === "roadmap" && (
        <>
          <div className="roadmap-grid">
            {[30, 60, 90].map((phase) => (
              <section className="panel" key={phase}>
                <div className="phase-heading">
                  <span>DAY {phase}</span>
                  <h2>
                    {phase === 30
                      ? "Establish & test"
                      : phase === 60
                        ? "Refine & connect"
                        : "Measure & improve"}
                  </h2>
                  <small>
                    {p.tasks.filter((t) => t.phase === phase && t.done).length}{" "}
                    / 3 complete
                  </small>
                </div>
                {p.tasks
                  .filter((t) => t.phase === phase)
                  .map((t) => (
                    <div className="task-card" key={t.id}>
                      <label className="task-check">
                        <input
                          type="checkbox"
                          disabled={busy}
                          checked={t.done}
                          onChange={(e) =>
                            act({
                              action: "task",
                              taskId: t.id,
                              done: e.target.checked,
                            })
                          }
                        />
                        <span className={t.done ? "done" : ""}>{t.title}</span>
                      </label>
                      <label className="task-owner">
                        Owner
                        <input
                          aria-label={`Owner for ${t.title}`}
                          defaultValue={t.owner}
                          onBlur={(e) => {
                            if (e.target.value !== t.owner)
                              act({
                                action: "task",
                                taskId: t.id,
                                owner: e.target.value,
                              });
                          }}
                        />
                      </label>
                    </div>
                  ))}
              </section>
            ))}
          </div>
          <section className="panel padded">
            <h2>Manual client validation</h2>
            <p>
              Demo projects do not count. A successful run requires approved
              assets, completed 30-day QA and recorded measurements.
            </p>
            <label>
              Client validation evidence
              <input
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Client sign-off reference and test outcome"
              />
            </label>
            <button
              className="button"
              disabled={busy || p.demo || p.successfulRun}
              onClick={() => act({ action: "run", evidence: sourceText })}
            >
              {p.successfulRun
                ? "Client run verified"
                : "Record successful manual run"}
            </button>
          </section>
        </>
      )}
      {p && section === "reporting" && (
        <>
          <div className="stats-grid three">
            <Stat
              title="Measurements recorded"
              value={p.results.length}
              note="Comparable baseline and current period"
              icon={<ChartColumn size={19} />}
            />
            <Stat
              title="Next review"
              value="Weekly"
              note="First 30 days; then monthly"
              icon={<Clock size={19} />}
            />
            <Stat
              title="Attribution"
              value="Unproven"
              note="Observed change is not causal proof"
              icon={<Target size={19} />}
            />
          </div>
          <section className="panel padded">
            <h2>Record a measured result</h2>
            <p>
              A baseline, comparable period and source are required before
              displaying change.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                act({
                  action: "result",
                  ...result,
                  baseline: Number(result.baseline),
                  current: Number(result.current),
                });
              }}
            >
              <div className="form-grid three">
                {Object.entries(result).map(([key, value]) => (
                  <label key={key}>
                    {key === "period"
                      ? "Comparable periods"
                      : key === "source"
                        ? "Measurement source"
                        : key.charAt(0).toUpperCase() + key.slice(1)}
                    <input
                      required
                      type={
                        ["baseline", "current"].includes(key)
                          ? "number"
                          : "text"
                      }
                      min={
                        ["baseline", "current"].includes(key) ? 0 : undefined
                      }
                      step="any"
                      value={value}
                      onChange={(e) =>
                        setResult({ ...result, [key]: e.target.value })
                      }
                    />
                  </label>
                ))}
              </div>
              <button className="button primary" disabled={busy}>
                <Plus size={16} />
                Log result
              </button>
            </form>
          </section>
          {p.results.length === 0 ? (
            <Empty
              title="No impact claimed yet"
              text="Record the baseline and a comparable measurement to begin reporting."
            />
          ) : (
            <section className="panel">
              <div className="section-heading">
                <h2>Observed results</h2>
              </div>
              {p.results.map((r) => (
                <div className="result-row" key={r.id}>
                  <div>
                    <h3>{r.metric}</h3>
                    <p>
                      {r.period} · {r.source}
                    </p>
                  </div>
                  <span>
                    {r.baseline} → <b>{r.current}</b> {r.unit}
                  </span>
                  <span className="status draft">
                    {r.baseline
                      ? (((r.current - r.baseline) / r.baseline) * 100).toFixed(
                          1,
                        ) + "% change"
                      : "No relative change: zero baseline"}
                  </span>
                </div>
              ))}
            </section>
          )}
          <div className="notice">
            Next suggested action: review inquiry response time with the lead
            owner, identify one measurable friction point and run a small test.
            No improvement or causality is assumed.
          </div>
          <button
            className="button"
            onClick={() => act({ action: "regenerate", assetId: "report" })}
            disabled={busy}
          >
            <RefreshCw size={16} />
            Refresh reporting narrative
          </button>
          {p.assets.find((a) => a.id === "report") && (
            <Editor
              key={p.revision}
              project={p}
              asset={p.assets.find((a) => a.id === "report")!}
              act={act}
              busy={busy}
            />
          )}
        </>
      )}
      {p && section === "export" && (
        <>
          <div className="export-hero">
            <div>
              <span className="eyebrow">CLIENT DELIVERY PACKAGE</span>
              <h2>Everything in its right place.</h2>
              <p>
                Eight skills, working drafts, workflow specifications and the
                evidence behind them.
              </p>
              <label className="ack-check">
                <input
                  type="checkbox"
                  checked={ack}
                  onChange={(e) => setAck(e.target.checked)}
                />
                I understand this is a draft package requiring client review.
              </label>
            </div>
            <button
              className="button primary"
              disabled={!ack}
              onClick={() =>
                window.location.assign(
                  `/api/projects/${p.id}/download?format=zip`,
                )
              }
            >
              <Download size={19} />
              Download delivery ZIP
            </button>
          </div>
          <div className="stats-grid three">
            <Stat
              title="Approved assets"
              value={`${approved} / ${p.assets.length}`}
              note="Drafts remain labeled in the bundle"
              icon={<ShieldCheck size={19} />}
            />
            <Stat
              title="QA issues"
              value={p.assets.reduce((n, a) => n + assetIssues(p, a).length, 0)}
              note="Review before approval or client use"
              icon={<AlertCircle size={19} />}
            />
            <Stat
              title="Package integrity"
              value="SHA-256"
              note="Per-file checksums included"
              icon={<CheckCircle2 size={19} />}
            />
          </div>
          <section className="panel">
            <div className="section-heading">
              <h2>Delivery structure</h2>
              <span className="status draft">No external delivery</span>
            </div>
            <div className="folder-grid">
              {[
                ["skills", "8 skill files + shared controls"],
                ["workspace", "Project state + source-atom ledger"],
                ["automation", "Make, n8n & Zapier specifications"],
                ["baseline", "Research sources + KPI records"],
                ["documentation", "Offer, outreach, SOP + roadmap"],
                ["portfolio", "Permission and evidence plan"],
                ["exports", "Drive folder manifest"],
              ].map(([name, desc]) => (
                <div key={name}>
                  <FolderOpen size={20} />
                  <span>
                    <b>/{name}</b>
                    <small>{desc}</small>
                  </span>
                </div>
              ))}
            </div>
          </section>
          <div className="export-formats">
            {[
              ["markdown", "Markdown"],
              ["csv", "CSV task list"],
              ["make", "Make specification"],
              ["json", "Workspace JSON"],
            ].map(([format, label]) => (
              <a
                className="button"
                key={format}
                href={`/api/projects/${p.id}/download?format=${format}`}
              >
                <Download size={16} />
                {label}
              </a>
            ))}
            <button className="button" onClick={() => window.print()}>
              <Printer size={16} />
              Print / save PDF
            </button>
          </div>
          <section className="panel padded">
            <h2>Client-ready document</h2>
            <p>
              Use Print / save PDF to export the offer, roadmap and reporting
              plan below.
            </p>
            <div className="print-document">
              <h1>{p.name} · Local Lead Engine</h1>
              <p>Draft for client review · Owner: Operator</p>
              {p.assets
                .filter((a) => ["offer", "sop", "report"].includes(a.kind))
                .map((a) => (
                  <section key={a.id}>
                    <pre>{a.body}</pre>
                  </section>
                ))}
            </div>
          </section>
          <section className="panel padded">
            <h2>Google Drive, Google Docs & Notion</h2>
            <p>
              Mock adapters prepare delivery payloads. No account is connected
              to this app. Download the bundle and review the folder manifest
              before enabling a live delivery adapter.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
function Stat({
  title,
  value,
  note,
  icon,
}: {
  title: string;
  value: string | number;
  note: string;
  icon: React.ReactNode;
}) {
  return (
    <section className="stat-card">
      <div>
        <span>{title}</span>
        {icon}
      </div>
      <strong>{value}</strong>
      <p>{note}</p>
    </section>
  );
}
function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <FolderOpen size={28} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
