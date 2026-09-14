"use client";
import { useState } from "react";
import {
  Save,
  RefreshCw,
  Check,
  Lock,
  Unlock,
  History,
  Download,
  Copy,
  CheckCircle,
  X,
  Sparkles,
} from "lucide-react";
import type { FactoryAsset, FactoryProject } from "@/lib/factory/model";
import { assetIssues } from "@/lib/factory/validation";
export type Act = (data: Record<string, unknown>) => Promise<void>;
export function Editor({
  asset,
  project,
  act,
  busy,
}: {
  asset: FactoryAsset;
  project: FactoryProject;
  act: Act;
  busy: boolean;
}) {
  const [body, setBody] = useState(asset.body);
  const [owner, setOwner] = useState(asset.owner);
  const [next, setNext] = useState(asset.nextAction);
  const [history, setHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState("edit");
  const dirty =
    body !== asset.body || owner !== asset.owner || next !== asset.nextAction;
  const issues = assetIssues(project, {
    ...asset,
    body,
    owner,
    nextAction: next,
  });
  const base = { assetId: asset.id, version: asset.version };
  return (
    <section className="editor-panel">
      <div className="editor-heading">
        <div>
          <div className="eyebrow">
            {asset.kind} / VERSION {asset.version}
          </div>
          <h2>{asset.name}</h2>
        </div>
        <span className={`status ${asset.status}`}>{asset.status}</span>
      </div>
      <div className="editor-toolbar">
        <div className="segmented">
          <button
            className={tab === "edit" ? "selected" : ""}
            onClick={() => setTab("edit")}
          >
            Editor
          </button>
          <button
            className={tab === "preview" ? "selected" : ""}
            onClick={() => setTab("preview")}
          >
            Read draft
          </button>
        </div>
        <div className="button-row">
          <button
            className="icon-btn"
            aria-label="Copy draft"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(body);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? <Check size={17} /> : <Copy size={17} />}
          </button>
          <button
            className="icon-btn"
            aria-label={asset.locked ? "Unlock module" : "Lock module"}
            disabled={busy || dirty}
            onClick={() => act({ ...base, action: "lock" })}
          >
            {asset.locked ? <Lock size={17} /> : <Unlock size={17} />}
          </button>
          <button
            className="icon-btn"
            aria-label="Version history"
            onClick={() => setHistory(!history)}
          >
            <History size={17} />
          </button>
        </div>
      </div>
      {tab === "edit" ? (
        <textarea
          aria-label="Asset editor"
          className="asset-textarea"
          value={body}
          readOnly={asset.locked}
          onChange={(e) => setBody(e.target.value)}
          spellCheck={false}
        />
      ) : (
        <pre className="asset-preview">{body}</pre>
      )}
      <div className="editor-meta">
        <label>
          Owner
          <input
            value={owner}
            disabled={asset.locked}
            onChange={(e) => setOwner(e.target.value)}
          />
        </label>
        <label>
          Next action
          <input
            value={next}
            disabled={asset.locked}
            onChange={(e) => setNext(e.target.value)}
          />
        </label>
      </div>
      {issues.length > 0 ? (
        <div className="review-box">
          <b>Before approval</b>
          <ul>
            {issues.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="qa-pass">
          <CheckCircle size={16} />
          Automated checks pass · Human fact review still required
        </div>
      )}
      <div className="editor-actions">
        <button
          className="button primary"
          disabled={busy || asset.locked || !dirty}
          onClick={() =>
            act({ ...base, action: "save", body, owner, nextAction: next })
          }
        >
          <Save size={16} />
          Save version
        </button>
        <button
          className="button"
          disabled={busy || asset.locked || dirty}
          onClick={() => act({ ...base, action: "regenerate" })}
        >
          <RefreshCw size={15} />
          Regenerate
        </button>
        {["content", "outreach"].includes(asset.kind) && (
          <button
            className="button"
            disabled={busy || dirty || asset.locked}
            onClick={() => act({ ...base, action: "humanize" })}
          >
            <Sparkles size={15} />
            Humanize
          </button>
        )}
        <button
          className="button"
          disabled={busy || dirty || asset.locked || issues.length > 0}
          onClick={() => act({ ...base, action: "approve" })}
        >
          <Check size={16} />
          Approve draft
        </button>
        <button
          className="button subtle"
          disabled={busy || dirty || asset.locked}
          onClick={() => act({ ...base, action: "reject" })}
        >
          Reject
        </button>
      </div>
      {dirty && (
        <p className="editor-note">
          Unsaved changes · Save before review or regeneration.
        </p>
      )}
      {history && (
        <div className="version-list">
          <h3>Version history</h3>
          {asset.history.length === 0 ? (
            <p>No previous versions yet. Save an edit to create one.</p>
          ) : (
            asset.history.map((v) => (
              <div className="version-row" key={v.version}>
                <span>
                  Version {v.version} · {new Date(v.savedAt).toLocaleString()}
                </span>
                <button
                  className="button"
                  disabled={dirty || asset.locked || busy}
                  onClick={() =>
                    act({
                      ...base,
                      action: "restore",
                      restoreVersion: v.version,
                    })
                  }
                >
                  Restore as new version
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
