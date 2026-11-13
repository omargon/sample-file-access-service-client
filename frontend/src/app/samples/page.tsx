'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { SampleSummary } from '../../types';
import { AccessBadge } from '../../components/StatusBadge';
import { CreateSampleModal } from '../../components/modals/CreateSampleModal';
import {
  Plus,
  Search,
  RefreshCw,
  FolderOpen,
  UserPlus,
  ShieldAlert,
  Copy,
  Check,
  FileText,
  Users,
  ShieldCheck,
  Lock,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function SamplesPage() {
  const currentUser = useCurrentUser();
  const [samples, setSamples] = useState<SampleSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'owned' | 'shared' | 'restricted'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchSamples = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getSamples(currentUser.apiKey);
      setSamples(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.apiKey]);

  useEffect(() => {
    fetchSamples();
  }, [fetchSamples]);

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Metrics
  const totalSamples = samples.length;
  const ownedCount = samples.filter((s) => s.isOwner).length;
  const sharedCount = samples.filter((s) => !s.isOwner && s.hasAccess).length;
  const totalFiles = samples.reduce((acc, s) => acc + (s.fileCount || 0), 0);

  // Filtered samples
  const filteredSamples = samples.filter((sample) => {
    const matchesSearch =
      sample.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sample.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sample.ownerName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'owned') return sample.isOwner;
    if (filterTab === 'shared') return !sample.isOwner && sample.hasAccess;
    if (filterTab === 'restricted') return !sample.hasAccess;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              View 2: Samples Catalog
            </span>
            <span className="text-zinc-600">&bull;</span>
            <span className="text-xs text-zinc-400">
              Logged in as <strong className="text-zinc-200">{currentUser.name}</strong> ({currentUser.id})
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Registered Biomedical Samples
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage genomic sequencing cohorts, attached sequencing files, and data access grants.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchSamples}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01]"
          >
            <Plus className="h-4 w-4" />
            Create New Sample
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Catalog Samples</span>
            <Layers className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{totalSamples}</div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Owned By Me</span>
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">{ownedCount}</div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Shared With Me</span>
            <Users className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400 mt-1">{sharedCount}</div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Files Attached</span>
            <FileText className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{totalFiles}</div>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search samples by name, ID, or owner..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterTab === 'all'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All ({samples.length})
          </button>
          <button
            onClick={() => setFilterTab('owned')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterTab === 'owned'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Owned ({ownedCount})
          </button>
          <button
            onClick={() => setFilterTab('shared')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterTab === 'shared'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Shared ({sharedCount})
          </button>
          <button
            onClick={() => setFilterTab('restricted')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterTab === 'restricted'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Restricted ({samples.filter((s) => !s.hasAccess).length})
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
          <span>Error loading samples: {error}</span>
        </div>
      )}

      {/* Tabular List of Samples */}
      <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-950/70 text-zinc-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3.5">Sample Name & ID</th>
                <th className="px-4 py-3.5">Owner</th>
                <th className="px-4 py-3.5">Your Access</th>
                <th className="px-4 py-3.5">Attached Files</th>
                <th className="px-4 py-3.5">Collaborators</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
                      Loading sample catalog...
                    </div>
                  </td>
                </tr>
              ) : filteredSamples.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <p className="text-sm">No samples found matching criteria.</p>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create a new sample now
                    </button>
                  </td>
                </tr>
              ) : (
                filteredSamples.map((sample) => {
                  const isOwner = sample.isOwner;
                  const hasAccess = sample.hasAccess;
                  const fileCount = sample.fileCount || sample.files?.length || 0;

                  return (
                    <tr
                      key={sample.id}
                      className="hover:bg-zinc-800/40 transition-colors group cursor-pointer"
                      onClick={() => (window.location.href = `/samples/${sample.id}`)}
                    >
                      {/* Name & ID */}
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/samples/${sample.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-zinc-100 hover:text-indigo-300 transition-colors flex items-center gap-2"
                        >
                          <FolderOpen className="h-4 w-4 text-indigo-400 shrink-0" />
                          <span>{sample.name}</span>
                        </Link>
                        <div className="flex items-center gap-1.5 mt-1 font-mono text-[11px] text-zinc-500">
                          <span>{sample.id}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyId(sample.id, e)}
                            className="text-zinc-600 hover:text-zinc-300 transition-colors"
                            title="Copy Sample ID"
                          >
                            {copiedId === sample.id ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              sample.ownerId === 'user-1' ? 'bg-indigo-400' : 'bg-sky-400'
                            }`}
                          />
                          <span className="text-zinc-300 font-medium">{sample.ownerName}</span>
                          <span className="text-[10px] font-mono text-zinc-500">({sample.ownerId})</span>
                        </div>
                      </td>

                      {/* Access Status */}
                      <td className="px-4 py-3.5">
                        <AccessBadge isOwner={isOwner} hasAccess={hasAccess} />
                      </td>

                      {/* Files count */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-xs">
                          <FileText className="h-3.5 w-3.5 text-zinc-400" />
                          {fileCount} {fileCount === 1 ? 'file' : 'files'}
                        </span>
                      </td>

                      {/* Collaborators */}
                      <td className="px-4 py-3.5">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-zinc-500" />
                          {sample.grantedUserIds?.length || 0} granted
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/samples/${sample.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/80 transition-colors"
                          >
                            <span>Files</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>

                          {/* Grant Access Button with Permission Enforcement */}
                          {isOwner ? (
                            <Link
                              href={`/samples/${sample.id}/access`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition-colors"
                              title="Manage collaborators as sample owner"
                            >
                              <UserPlus className="h-3 w-3" />
                              <span>Grant Access</span>
                            </Link>
                          ) : (
                            <button
                              disabled
                              title="Permission restricted: Only sample owner can grant access to collaborators"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800/40 text-zinc-600 text-xs font-medium border border-zinc-800 cursor-not-allowed"
                            >
                              <Lock className="h-3 w-3 text-zinc-600" />
                              <span>Owner Only</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Sample Modal */}
      <CreateSampleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchSamples}
      />
    </div>
  );
}
