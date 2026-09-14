'use client';
import { useState } from 'react';
import { Download, CheckCircle2, Circle, AlertTriangle, ExternalLink, Archive } from 'lucide-react';
import type { ExportTier } from '@/lib/types';

const PREFLIGHT = [
  'Business intake completed',
  'All critical fact locks verified',
  'Revenue-Leak Audit reviewed',
  'Opportunity selected',
  'Offer reviewed (approved or draft acknowledged)',
  'Escalation rules approved by client',
  'KPI baseline defined (even if not yet measured)',
  'Human review points documented',
];

export default function ExportPageClient({ projectId, projectName, existingPackage }: {
  projectId: string;
  projectName: string;
  existingPackage: any;
}) {
  const [preflightChecked, setPreflightChecked] = useState<Record<number, boolean>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<any>(existingPackage);

  const togglePreflight = (i: number) => setPreflightChecked(prev => ({ ...prev, [i]: !prev[i] }));
  const preflightComplete = PREFLIGHT.every((_, i) => preflightChecked[i]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/export`, { method: 'POST' });
      const { exportPackage } = await res.json();
      setExportResult(exportPackage);
    } finally {
      setIsExporting(false);
    }
  };

  const ADAPTER_ICONS: Record<string, string> = {
    'Google Drive': '📁', 'Google Docs': '📄', 'Notion': '📝',
    'Make': '⚡', 'n8n': '🔁', 'Zapier': '🔗', 'CSV': '📊', 'PDF': '📑',
  };

  return (
    <div className="space-y-6">
      {/* Pre-flight checklist */}
      <div className="card p-6">
        <h2 className="section-title mb-4">Export Readiness Checklist</h2>
        <div className="space-y-2 mb-4">
          {PREFLIGHT.map((item, i) => (
            <button
              key={i}
              onClick={() => togglePreflight(i)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-50 text-left transition-colors"
            >
              {preflightChecked[i]
                ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                : <Circle className="h-5 w-5 text-surface-300 shrink-0" />
              }
              <span className={`text-sm ${preflightChecked[i] ? 'text-surface-600 line-through' : 'text-surface-800'}`}>{item}</span>
            </button>
          ))}
        </div>

        {!preflightComplete && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-700 mb-4">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Complete all pre-flight checks before generating the export bundle.
          </div>
        )}

        <button
          onClick={handleExport}
          disabled={!preflightComplete || isExporting}
          className="btn-primary w-full justify-center"
        >
          <Archive className="h-4 w-4" />
          {isExporting ? 'Generating bundle...' : 'Generate Export Bundle'}
        </button>
      </div>

      {/* 7-tier preview */}
      {exportResult && (
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Export Package</h2>
            <span className="badge badge-approved">Ready</span>
          </div>
          <p className="text-xs text-surface-500 mb-4">
            Generated {exportResult.exportedAt ? new Date(exportResult.exportedAt).toLocaleString() : 'just now'} · Mock delivery — no live integrations activated
          </p>
          <div className="space-y-3">
            {exportResult.tiers.map((tier: ExportTier) => (
              <div key={tier.name} className="border border-surface-200 rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 bg-surface-50 border-b border-surface-200 flex items-center gap-2">
                  <Download className="h-3.5 w-3.5 text-surface-400" />
                  <span className="text-xs font-mono font-semibold text-surface-700">{tier.name}</span>
                  <span className="ml-auto text-xs text-surface-400">{tier.files.length} file{tier.files.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="divide-y divide-surface-100">
                  {tier.files.map((file: any) => (
                    <div key={file.filename} className="px-4 py-2 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-mono text-surface-700">{file.filename}</p>
                        <p className="text-[10px] text-surface-400">{file.description}</p>
                      </div>
                      <span className={`badge ${file.status === 'ready' ? 'badge-approved' : file.status === 'missing' ? 'badge-high' : 'badge-draft'}`}>
                        {file.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mock adapters */}
      <div className="card p-6">
        <h2 className="section-title mb-4">Mock Export Adapters</h2>
        <p className="text-xs text-surface-500 mb-4">No live connections are active. These adapters show where files would be delivered when integrations are configured and approved.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(ADAPTER_ICONS).map(([name, icon]) => (
            <div key={name} className="p-3 bg-surface-50 border border-surface-200 rounded-lg text-center">
              <p className="text-2xl mb-1">{icon}</p>
              <p className="text-xs font-medium text-surface-600">{name}</p>
              <p className="text-[10px] text-surface-400 mt-0.5">Mock only</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

