"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check, ScanLine } from "lucide-react";
import type { FactoryProject } from "@/lib/factory/model";
export function Intake({ project }: { project?: FactoryProject }) {
  const router = useRouter();
  const b = project?.businessProfile;
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Record<string, string>>({
    name: b?.name || "",
    url: b?.url || "",
    industry: b?.industry || "",
    city: b?.city || "",
    serviceArea: b?.serviceArea || "",
    services: b?.services.join(", ") || "",
    primaryGoal: b?.primaryGoal || "More qualified leads",
    bookingTool: b?.bookingTool || "",
    crm: b?.crm || "",
    communicationChannels: b?.communicationChannels.join(", ") || "",
    painPoints: b?.painPoints || "",
    pricingGuidance: b?.pricingGuidance || "",
    leadSources: b?.leadSources || "",
    faqs: b?.faqs || "",
    complianceNotes: b?.complianceNotes || "",
    address: b?.address || "",
    phone: b?.phone || "",
    reviewScore: b?.reviewScore || "",
    reviewSummary: b?.reviewSummary || "",
    reviewSource: b?.reviewSource || "",
    ...Object.fromEntries(
      [
        "LinkedIn",
        "X",
        "Instagram",
        "Facebook",
        "YouTube",
        "TikTok",
        "Pinterest",
      ].map((k) => [k, b?.socials?.[k] || ""]),
    ),
  });
  const fields = [
    ["name", "Business name", "Suncoast Home Services"],
    ["url", "Business website", "https://example.com"],
    ["industry", "Industry", "Home services"],
    ["city", "City", "Tampa"],
    ["serviceArea", "Service area", "Tampa Bay"],
    ["address", "Business address", "Optional public address"],
    ["phone", "Business phone", "Optional public number"],
  ];
  const locked = (k: string) =>
    project?.factLocks?.some((f) => f.field === k && f.locked);
  const field = (k: string, label: string, placeholder = "", area = false) => (
    <label key={k} className={area ? "full-span" : ""}>
      {label}
      {locked(k) && " · Locked"}
      {area ? (
        <textarea
          rows={3}
          value={form[k]}
          disabled={locked(k)}
          placeholder={placeholder}
          onChange={(e) => setForm({ ...form, [k]: e.target.value })}
        />
      ) : (
        <input
          value={form[k]}
          disabled={locked(k)}
          type={k === "url" ? "url" : "text"}
          placeholder={placeholder}
          onChange={(e) => setForm({ ...form, [k]: e.target.value })}
        />
      )}
    </label>
  );
  function next() {
    if (
      step === 0 &&
      (!form.name.trim() || !form.industry.trim() || !form.city.trim())
    ) {
      setError("Enter a business name, industry and city.");
      return;
    }
    if (step === 1 && !form.services.trim()) {
      setError("Add at least one service.");
      return;
    }
    setError("");
    setStep(step + 1);
  }
  async function submit() {
    setBusy(true);
    setError("");
    try {
      const socials = Object.fromEntries(
        [
          "LinkedIn",
          "X",
          "Instagram",
          "Facebook",
          "YouTube",
          "TikTok",
          "Pinterest",
        ]
          .filter((k) => form[k])
          .map((k) => [k, form[k]]),
      );
      const res = await fetch(
        project ? `/api/projects/${project.id}` : "/api/projects",
        {
          method: project ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessProfile: {
              ...form,
              socials,
              services: form.services
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              communicationChannels: form.communicationChannels
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            },
          }),
        },
      );
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      router.push(`/projects/${d.project.id}/intelligence`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save intake.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="intake-layout">
      <div>
        <div className="eyebrow">LOCAL LEAD ENGINE / INTAKE</div>
        <h1>
          {project ? "Edit business intake" : "Let’s build your next system."}
        </h1>
        <p className="page-description">
          Start with the business. We’ll turn the details into a focused
          delivery package.
        </p>
        <div className="wizard-steps">
          {["Business", "Outcome", "Tools & proof", "Review"].map((name, i) => (
            <div className={i <= step ? "current" : ""} key={name}>
              <span>{i < step ? <Check size={15} /> : i + 1}</span>
              {name}
            </div>
          ))}
        </div>
        <section className="panel form-panel">
          <div className="section-heading">
            <h2>
              {
                [
                  "The business behind the project",
                  "Define a useful outcome",
                  "Tools, proof & boundaries",
                  "Review your starting point",
                ][step]
              }
            </h2>
            <span className="muted">{step + 1} / 4</span>
          </div>
          <div className="form-grid">
            {step === 0 && fields.map(([k, l, p]) => field(k, l, p))}
            {step === 1 && (
              <>
                {field(
                  "services",
                  "Services offered",
                  "Separate services with commas",
                  true,
                )}
                <label className="full-span">
                  Primary objective
                  <select
                    value={form.primaryGoal}
                    onChange={(e) =>
                      setForm({ ...form, primaryGoal: e.target.value })
                    }
                  >
                    {[
                      "More qualified leads",
                      "More booked appointments",
                      "Better local visibility",
                      "Content production",
                      "Operational automation",
                      "E-commerce conversion",
                      "Custom",
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                {field(
                  "painPoints",
                  "What is getting in the way?",
                  "Describe the owner-reported problem.",
                  true,
                )}
                {field(
                  "pricingGuidance",
                  "Approved pricing guidance",
                  "Leave blank until the client confirms.",
                  true,
                )}
              </>
            )}
            {step === 2 && (
              <>
                {field(
                  "bookingTool",
                  "Booking tool",
                  "Phone, Calendly, or unconfirmed",
                )}
                {field(
                  "crm",
                  "CRM / lead tracking",
                  "HubSpot, spreadsheet, or unconfirmed",
                )}
                {field(
                  "communicationChannels",
                  "Contact channels",
                  "Phone, email, website",
                )}
                {field(
                  "leadSources",
                  "Lead sources",
                  "Referrals, GBP, organic search",
                )}
                {field(
                  "faqs",
                  "FAQs and policy notes",
                  "Only include approved answers.",
                  true,
                )}
                {field(
                  "reviewScore",
                  "Review score",
                  "Include scale and platform",
                )}
                {field(
                  "reviewSource",
                  "Review source URL",
                  "Public review source",
                )}
                {field(
                  "reviewSummary",
                  "Review summary",
                  "Do not infer website quality from a review score.",
                  true,
                )}
                {[
                  "LinkedIn",
                  "X",
                  "Instagram",
                  "Facebook",
                  "YouTube",
                  "TikTok",
                  "Pinterest",
                ].map((k) => field(k, k + " URL", "Optional"))}
                {field(
                  "complianceNotes",
                  "Privacy, consent & constraints",
                  "Approvals, exclusions, retention, escalation owner",
                  true,
                )}
              </>
            )}
            {step === 3 && (
              <div className="full-span intake-review">
                <h3>{form.name}</h3>
                <p>
                  {form.industry} · {form.city}
                </p>
                <dl>
                  <dt>Objective</dt>
                  <dd>{form.primaryGoal}</dd>
                  <dt>Services</dt>
                  <dd>{form.services}</dd>
                  <dt>Current tools</dt>
                  <dd>
                    {[form.bookingTool, form.crm].filter(Boolean).join(" · ") ||
                      "Needs review"}
                  </dd>
                  <dt>Starting evidence</dt>
                  <dd>
                    User-provided intake; public website scan is available next.
                  </dd>
                </dl>
                <div className="notice">
                  Your package starts in draft. You can review, edit and lock
                  each module. New templates remain deferred until three
                  verified manual client runs.
                </div>
              </div>
            )}
          </div>
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
          <div className="form-actions">
            <button
              className="button"
              disabled={step === 0 || busy}
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            {step < 3 ? (
              <button className="button primary" onClick={next}>
                Continue
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className="button primary"
                disabled={busy}
                onClick={submit}
              >
                {busy
                  ? "Building your workspace…"
                  : project
                    ? "Save intake"
                    : "Create project & generate drafts"}
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </section>
      </div>
      <aside className="intake-aside">
        <span className="outline-icon">
          <ScanLine size={26} />
        </span>
        <h2>A clear path from intake to delivery.</h2>
        <ol>
          <li>Confirm what’s true</li>
          <li>Find the biggest friction point</li>
          <li>Choose the smallest useful system</li>
          <li>Review your delivery package</li>
        </ol>
        <div className="aside-note">
          About 15 minutes for an initial operator-reviewed draft. Client
          validation and deployment take additional time.
        </div>
      </aside>
    </div>
  );
}
