'use client';
import type { EvidenceLabel } from '@/lib/types';

const CONFIG: Record<EvidenceLabel, { label: string; className: string; icon: string }> = {
  'sourced':        { label: 'Sourced',        className: 'badge-sourced',        icon: '✓' },
  'user-provided':  { label: 'User-provided',  className: 'badge-user',           icon: '↑' },
  'inferred':       { label: 'Inferred',        className: 'badge-inferred',       icon: '~' },
  'recommendation': { label: 'Recommendation', className: 'badge-recommendation', icon: '→' },
  'needs-review':   { label: 'Needs review',   className: 'badge-needs-review',   icon: '!' },
};

export function EvidenceBadge({ label }: { label: EvidenceLabel }) {
  const cfg = CONFIG[label];
  return (
    <span className={cfg.className} title={`Evidence type: ${cfg.label}`}>
      <span aria-hidden="true">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

export function EvidenceLegend() {
  return (
    <div className="flex flex-wrap gap-2 p-3 bg-surface-50 rounded-lg border border-surface-200">
      <span className="text-xs font-medium text-surface-500 mr-1 self-center">Evidence:</span>
      {(Object.keys(CONFIG) as EvidenceLabel[]).map(key => (
        <EvidenceBadge key={key} label={key} />
      ))}
    </div>
  );
}

