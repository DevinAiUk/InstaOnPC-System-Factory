'use client';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import type { Opportunity } from '@/lib/types';

interface Props {
  opportunity: Opportunity;
}

export function OpportunityScoreCard({ opportunity }: Props) {
  const radarData = opportunity.dimensions.map(d => ({
    dimension: d.name,
    score: d.score,
    weight: Math.round(d.weight * 100),
  }));

  const scoreColor =
    opportunity.compositeScore >= 80 ? 'text-green-600' :
    opportunity.compositeScore >= 60 ? 'text-accent-600' :
    'text-amber-600';

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-surface-900">{opportunity.name}</h3>
          <p className="text-sm text-surface-500 mt-0.5">Rank #{opportunity.rank}</p>
        </div>
        <div className="text-right">
          <p className={`text-4xl font-bold tabular-nums ${scoreColor}`}>{opportunity.compositeScore}</p>
          <p className="text-xs text-surface-400 mt-0.5">/ 100 composite</p>
        </div>
      </div>

      <div className="h-48 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: '#64748b' }} />
            <Radar name="Score" dataKey="score" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.15} strokeWidth={2} />
            <Tooltip
              formatter={(value, name) => [`${value ?? 0}/100`, name]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-2">
        {opportunity.dimensions.map(d => (
          <div key={d.name} className="flex items-center gap-3">
            <span className="text-xs text-surface-500 w-36 shrink-0">{d.name}</span>
            <div className="flex-1 bg-surface-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-accent-500 rounded-full transition-all"
                style={{ width: `${d.score}%` }}
              />
            </div>
            <span className="text-xs font-mono text-surface-600 w-8 text-right">{d.score}</span>
            <span className="text-xs text-surface-400 w-10 text-right">×{d.weight}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-surface-50 rounded-lg border border-surface-200">
        <p className="text-xs text-surface-500">
          <strong className="text-surface-700">Disclaimer:</strong> This score reflects operational readiness and problem clarity. It does not predict revenue, lead volume, traffic, or ROI.
        </p>
      </div>
    </div>
  );
}

