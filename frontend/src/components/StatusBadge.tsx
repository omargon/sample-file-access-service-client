import React from 'react';
import { QCStatus } from '../types';
import { CheckCircle2, Clock, XCircle, ShieldCheck, Users, Lock, Key } from 'lucide-react';

interface QCBadgeProps {
  status: QCStatus;
  size?: 'sm' | 'md';
}

export function QCBadge({ status, size = 'md' }: QCBadgeProps) {
  const isSm = size === 'sm';
  const iconSize = isSm ? 12 : 14;

  if (status === 'passed') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${
          isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <CheckCircle2 size={iconSize} className="text-emerald-400" />
        Passed
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 ${
          isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <Clock size={iconSize} className="text-amber-300 animate-pulse" />
        QC Pending
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 ${
        isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <XCircle size={iconSize} className="text-rose-400" />
      QC Failed
    </span>
  );
}

interface AccessBadgeProps {
  isOwner: boolean;
  hasAccess: boolean;
  size?: 'sm' | 'md';
}

export function AccessBadge({ isOwner, hasAccess, size = 'md' }: AccessBadgeProps) {
  const isSm = size === 'sm';
  const iconSize = isSm ? 12 : 14;

  if (isOwner) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 ${
          isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <ShieldCheck size={iconSize} className="text-indigo-400" />
        Owner
      </span>
    );
  }

  if (hasAccess) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20 ${
          isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <Users size={iconSize} className="text-sky-400" />
        Collaborator
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50 ${
        isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Lock size={iconSize} className="text-zinc-500" />
      Restricted
    </span>
  );
}

interface UserRoleBadgeProps {
  isPipeline?: boolean;
}

export function UserRoleBadge({ isPipeline }: UserRoleBadgeProps) {
  if (isPipeline) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20">
        <Key size={10} />
        Internal Pipeline
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
      Researcher
    </span>
  );
}
