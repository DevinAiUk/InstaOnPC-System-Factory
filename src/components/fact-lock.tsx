'use client';
import { useState } from 'react';
import { Lock, Unlock, AlertCircle } from 'lucide-react';
import type { FactLock as FactLockType } from '@/lib/types';

interface Props {
  factLock: FactLockType;
  onLock?: (id: string) => void;
  onUnlock?: (id: string) => void;
}

export function FactLockCard({ factLock, onLock, onUnlock }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (factLock.locked) {
        onUnlock?.(factLock.id);
      } else {
        onLock?.(factLock.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`card p-4 flex items-start justify-between gap-4 ${factLock.locked ? 'border-green-200 bg-green-50/30' : 'border-amber-200 bg-amber-50/30'}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs font-mono text-surface-500 uppercase tracking-wide">{factLock.field}</p>
          {!factLock.locked && (
            <span className="flex items-center gap-1 text-xs text-amber-600">
              <AlertCircle className="h-3 w-3" />
              Needs verification
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-surface-900 truncate">{factLock.value}</p>
        {factLock.locked && factLock.lockedBy && (
          <p className="text-xs text-surface-500 mt-1">
            Locked by {factLock.lockedBy}
            {factLock.lockedAt && ` · ${new Date(factLock.lockedAt).toLocaleDateString()}`}
          </p>
        )}
      </div>

      <button
        onClick={handleToggle}
        disabled={isLoading}
        aria-label={factLock.locked ? `Unlock ${factLock.field}` : `Lock ${factLock.field}`}
        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          factLock.locked
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
        } disabled:opacity-50`}
      >
        {factLock.locked
          ? <><Lock className="h-3.5 w-3.5" /> Locked</>
          : <><Unlock className="h-3.5 w-3.5" /> Lock</>
        }
      </button>
    </div>
  );
}

