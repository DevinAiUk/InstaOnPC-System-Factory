'use client';
import { useState } from 'react';
import { Check, X, Edit2, MessageSquare } from 'lucide-react';
import type { ApprovalStatus } from '@/lib/types';

interface Props {
  status: ApprovalStatus;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onEdit?: () => void;
  label?: string;
}

export function ApprovalControls({ status, onApprove, onReject, onEdit, label = 'this section' }: Props) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState('');

  const handleReject = () => {
    if (!reason.trim()) return;
    onReject(reason);
    setShowRejectForm(false);
    setReason('');
  };

  if (status === 'approved') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
        <Check className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-700 font-medium">Approved</span>
        {onEdit && (
          <button onClick={onEdit} className="ml-auto btn-ghost text-xs">
            <Edit2 className="h-3 w-3" /> Edit &amp; re-review
          </button>
        )}
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
        <X className="h-4 w-4 text-red-600" />
        <span className="text-sm text-red-700 font-medium">Rejected</span>
        {onEdit && (
          <button onClick={onEdit} className="ml-auto btn-ghost text-xs">
            <Edit2 className="h-3 w-3" /> Revise &amp; resubmit
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={onApprove}
          className="btn-primary"
          aria-label={`Approve ${label}`}
        >
          <Check className="h-4 w-4" /> Approve
        </button>
        <button
          onClick={() => setShowRejectForm(v => !v)}
          className="btn-secondary"
          aria-label={`Reject ${label}`}
        >
          <X className="h-4 w-4" /> Reject
        </button>
        {onEdit && (
          <button onClick={onEdit} className="btn-ghost" aria-label={`Edit ${label}`}>
            <Edit2 className="h-4 w-4" /> Edit
          </button>
        )}
      </div>

      {showRejectForm && (
        <div className="flex gap-2 animate-slide-up">
          <input
            type="text"
            className="input flex-1"
            placeholder="Reason for rejection (required)"
            value={reason}
            onChange={e => setReason(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleReject()}
            autoFocus
            aria-label="Rejection reason"
          />
          <button
            onClick={handleReject}
            disabled={!reason.trim()}
            className="btn-danger flex-shrink-0"
          >
            <MessageSquare className="h-4 w-4" /> Submit
          </button>
        </div>
      )}
    </div>
  );
}

