"use client";

import React, { useState } from 'react';
import { VerifyStatus } from '../types/credential.types';
import { AlertTriangle, ShieldAlert, AlertOctagon, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/utils/cn';

interface RevocationModalProps {
  credentialCode: string;
  studentName: string;
  newStatus: VerifyStatus;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

const MIN_REASON_LENGTH = 10;

export function RevocationModal({
  credentialCode,
  studentName,
  newStatus,
  onConfirm,
  onCancel,
}: RevocationModalProps) {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  const isRevoke = newStatus === 'REVOKED';
  const isSuspend = newStatus === 'SUSPENDED';
  const isReactivate = newStatus === 'ACTIVE';

  const isValid = isReactivate || reason.trim().length >= MIN_REASON_LENGTH;
  const showError = touched && !isValid;

  const config = isRevoke
    ? {
        icon: <ShieldAlert className="h-8 w-8 text-red-500" />,
        title: 'Revoke Credential',
        subtitle: 'This action is permanent and cannot be undone.',
        iconBg: 'bg-red-100',
        accent: 'border-red-200',
        stripe: 'bg-red-500',
        confirmClass: 'bg-red-500 hover:bg-red-600 text-white border-0',
      }
    : isSuspend
    ? {
        icon: <AlertTriangle className="h-8 w-8 text-amber-500" />,
        title: 'Suspend Credential',
        subtitle: 'The credential will be temporarily invalidated but can be reactivated.',
        iconBg: 'bg-amber-100',
        accent: 'border-amber-200',
        stripe: 'bg-amber-500',
        confirmClass: 'bg-amber-500 hover:bg-amber-600 text-white border-0',
      }
    : {
        icon: <AlertOctagon className="h-8 w-8 text-emerald-500" />,
        title: 'Reactivate Credential',
        subtitle: 'The credential will be marked as ACTIVE again.',
        iconBg: 'bg-emerald-100',
        accent: 'border-emerald-200',
        stripe: 'bg-emerald-500',
        confirmClass: 'bg-emerald-500 hover:bg-emerald-600 text-white border-0',
      };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className={cn('relative z-10 w-full max-w-md rounded-2xl border bg-white shadow-2xl overflow-hidden', config.accent)}>
        <div className={cn('h-1.5 w-full', config.stripe)} />
        <div className="p-6 space-y-5">
          <button onClick={onCancel} className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
            <X className="h-4 w-4 text-muted" />
          </button>
          <div className="flex items-start gap-4">
            <div className={cn('h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center', config.iconBg)}>
              {config.icon}
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">{config.title}</h2>
              <p className="text-sm text-muted mt-0.5">{config.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border-light bg-neutral-50 p-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted font-medium uppercase tracking-wider">Student</p>
              <p className="text-sm font-semibold text-on-surface truncate">{studentName}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted font-medium uppercase tracking-wider">Code</p>
              <p className="text-xs font-mono text-primary font-bold">{credentialCode}</p>
            </div>
          </div>
          {!isReactivate && (
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-on-surface">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder={`Explain why you are ${isRevoke ? 'revoking' : 'suspending'} this credential...`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                onBlur={() => setTouched(true)}
                className={cn(
                  'w-full rounded-xl border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 transition-all',
                  showError
                    ? 'border-red-400 focus:ring-red-200 bg-red-50'
                    : 'border-border-light focus:ring-primary/20 focus:border-primary bg-white'
                )}
              />
              <div className="flex items-center justify-between">
                {showError ? (
                  <p className="text-xs text-red-500">Reason must be at least {MIN_REASON_LENGTH} characters.</p>
                ) : (
                  <p className="text-xs text-muted">This reason is recorded in the audit log.</p>
                )}
                <span className={cn('text-xs font-medium', reason.trim().length >= MIN_REASON_LENGTH ? 'text-emerald-600' : 'text-muted')}>
                  {reason.trim().length}/{MIN_REASON_LENGTH}+
                </span>
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <Button variant="outline" onClick={onCancel} className="flex-1 rounded-xl">Cancel</Button>
            <Button
              onClick={() => { setTouched(true); if (isValid) onConfirm(reason.trim()); }}
              disabled={!isValid}
              className={cn('flex-1 rounded-xl', config.confirmClass)}
            >
              Confirm {config.title.split(' ')[0]}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
