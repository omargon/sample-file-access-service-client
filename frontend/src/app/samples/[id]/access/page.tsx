'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth, useCurrentUser } from '../../../../context/AuthContext';
import { api } from '../../../../lib/api';
import { SampleDetail, User } from '../../../../types';
import { AccessBadge } from '../../../../components/StatusBadge';
import {
  ArrowLeft,
  ShieldCheck,
  UserPlus,
  Users,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export default function SampleAccessPage() {
  const params = useParams();
  const sampleId = params.id as string;
  const currentUser = useCurrentUser();
  const { availableUsers } = useAuth();

  const [sample, setSample] = useState<SampleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState('user-2');
  const [isGranting, setIsGranting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSample = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getSample(sampleId, currentUser.apiKey);
      setSample(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [sampleId, currentUser.apiKey]);

  useEffect(() => {
    fetchSample();
  }, [fetchSample]);

  const isOwner = sample?.isOwner ?? false;
  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sample || !isOwner) return;

    try {
      setIsGranting(true);
      setError(null);
      setSuccessMessage(null);

      const res = await api.grantAccess(currentUser.apiKey, sampleId, targetUserId);
      setSuccessMessage(`Access successfully granted to ${targetUserId}! Message: "${res.message}"`);
      await fetchSample();
    } catch (err) {
      setError(`Failed to grant access: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsGranting(false);
    }
  };

  // Eligible users to grant (excluding owner)
  const candidateUsers = availableUsers.filter((u) => u.id !== sample?.ownerId && !u.isPipeline);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <div className="mb-4">
        <Link
          href={`/samples/${sampleId}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Sample Files
        </Link>
      </div>

      {/* Header */}
      <div className="pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            View 4: Access Governance
          </span>
          <span className="text-zinc-600">&bull;</span>
          <span className="text-xs text-zinc-400">
            Active Session: <strong className="text-zinc-200">{currentUser.name}</strong> ({currentUser.id})
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
          Sample Access & Sharing Permissions
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Authorize collaborators to view sample files and generate time-limited download links.
        </p>
      </div>

      {/* Sample Context Card */}
      {sample && (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs text-zinc-400 font-mono">Sample ID: {sample.sampleId}</div>
            <h2 className="text-base font-semibold text-zinc-100 mt-0.5">{sample.sampleName}</h2>
            <div className="flex items-center gap-2 mt-2 text-xs text-zinc-400">
              <span>Owner:</span>
              <strong className="text-zinc-200">{sample.ownerName}</strong>
              <span className="font-mono text-zinc-500">({sample.ownerId})</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AccessBadge isOwner={sample.isOwner} hasAccess={sample.hasAccess} />
          </div>
        </div>
      )}

      {/* Status Notifications */}
      {successMessage && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Owner vs Non-Owner Form Section */}
      <div className="mt-6">
        {isOwner ? (
          /* OWNER: Active Grant Form */
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/5 to-zinc-900/60 p-6 shadow-xl">
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Grant Access to a Collaborator
                </h3>
                <p className="text-xs text-zinc-400">
                  As the verified owner of this sample, you can grant download privileges to other researchers.
                </p>
              </div>
            </div>

            <form onSubmit={handleGrantAccess} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Select Target User
                </label>
                <div className="relative">
                  <select
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full appearance-none rounded-xl bg-zinc-950 border border-zinc-700/80 px-4 py-2.5 text-xs text-zinc-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {candidateUsers.map((u) => {
                      const alreadyHasAccess = sample?.grantedUserIds.includes(u.id);
                      return (
                        <option key={u.id} value={u.id} className="bg-zinc-900">
                          {u.name} ({u.id}) {alreadyHasAccess ? '— (Already Granted)' : '— Available'}
                        </option>
                      );
                    })}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-1.5 text-[11px] text-zinc-500">
                  POST /sample/:id/access will be dispatched with header x-api-key: {currentUser.apiKey}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isGranting}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {isGranting ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="h-3.5 w-3.5" />
                  )}
                  Grant Sample Access
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* NON-OWNER: Permission Boundary Enforced Guard */
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <Lock className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
              <div className="text-xs space-y-1">
                <h4 className="font-semibold text-amber-200">
                  Permission Boundary Guard: Owner Authority Required
                </h4>
                <p className="text-amber-300/90 leading-relaxed">
                  Only the designated sample owner (<strong className="text-white">{sample?.ownerName}</strong>)
                  can grant access to other collaborators. Because you are currently authenticated as{' '}
                  <strong className="text-white">{currentUser.name}</strong> ({currentUser.id}),
                  the backend will reject any access grant with <code className="font-mono bg-zinc-900 px-1 py-0.5 rounded">403 Forbidden</code>.
                </p>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Collaborator Roster */}
      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-950/40 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-400" />
              Access Permissions Roster
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Users currently authorized to access this sample and its QC-passed files.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
            {1 + (sample?.grantedUserIds?.length || 0)} Authorized
          </span>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {/* Owner row */}
          <div className="p-4 flex items-center justify-between bg-indigo-500/5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">
                {sample?.ownerName?.charAt(0) || 'O'}
              </div>
              <div>
                <div className="text-xs font-medium text-zinc-100 flex items-center gap-2">
                  <span>{sample?.ownerName}</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono">
                    Sample Owner
                  </span>
                </div>
                <div className="text-[11px] font-mono text-zinc-500">ID: {sample?.ownerId}</div>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs text-indigo-300 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                Full Authority
              </span>
            </div>
          </div>

          {/* Granted users */}
          {sample?.grantedUserIds && sample.grantedUserIds.length > 0 ? (
            sample.grantedUserIds.map((userId) => {
              const userObj = availableUsers.find((u) => u.id === userId);
              const displayName = userObj ? userObj.name : userId;

              return (
                <div key={userId} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-white text-xs font-bold">
                      {displayName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-zinc-100 flex items-center gap-2">
                        <span>{displayName}</span>
                        <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded font-mono">
                          Collaborator
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-500">ID: {userId}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      Download Permitted
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-zinc-500 italic">
              No additional collaborators have been granted access yet. This sample is private to {sample?.ownerName}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
