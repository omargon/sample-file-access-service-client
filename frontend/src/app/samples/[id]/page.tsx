'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCurrentUser } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import { SampleDetail, DownloadRequestResponse } from '../../../types';
import { QCBadge, AccessBadge } from '../../../components/StatusBadge';
import { DownloadModal } from '../../../components/modals/DownloadModal';
import {
  ArrowLeft,
  FileText,
  Download,
  Lock,
  RefreshCw,
  UserPlus,
  ShieldAlert,
  Copy,
  Check,
  Cpu,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function SampleFilesPage() {
  const params = useParams();
  const sampleId = params.id as string;
  const currentUser = useCurrentUser();

  const [sample, setSample] = useState<SampleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Download modal state
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [activeDownloadData, setActiveDownloadData] = useState<DownloadRequestResponse | null>(null);
  const [activeDownloadFileName, setActiveDownloadFileName] = useState<string>('');
  const [requestingFileId, setRequestingFileId] = useState<string | null>(null);

  // QC update state
  const [updatingFileId, setUpdatingFileId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDownloadRequest = async (fileId: string, fileName: string) => {
    try {
      setRequestingFileId(fileId);
      setActionError(null);
      const res = await api.requestDownload(currentUser.apiKey, fileId);
      setActiveDownloadData(res);
      setActiveDownloadFileName(fileName);
      setDownloadModalOpen(true);
    } catch (err) {
      setActionError(`Download request rejected (403 Forbidden): ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setRequestingFileId(null);
    }
  };

  const handleQCStatusChange = async (fileId: string, qcStatus: 'passed' | 'failed') => {
    if (!currentUser.isPipeline) {
      setActionError('Only the QC Pipeline user can update file QC status.');
      return;
    }

    try {
      setUpdatingFileId(fileId);
      setActionError(null);
      await api.updateQCStatus(currentUser.apiKey, fileId, qcStatus);
      await fetchSample();
    } catch (err) {
      setActionError(`QC update failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUpdatingFileId(null);
    }
  };

  const getFileIcon = (fileName: string) => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.bam')) return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">BAM</span>;
    if (lower.endsWith('.vcf') || lower.endsWith('.vcf.gz')) return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">VCF</span>;
    if (lower.endsWith('.fastq') || lower.endsWith('.fastq.gz')) return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">FASTQ</span>;
    if (lower.endsWith('.pdf')) return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">PDF</span>;
    return <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">DATA</span>;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <div className="mb-4">
        <Link
          href="/samples"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Samples Catalog
        </Link>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Files & QC Inspector
            </span>
            <span className="text-zinc-600">&bull;</span>
            <span className="text-xs text-zinc-400">
              Active Session: <strong className="text-zinc-200">{currentUser.name}</strong> ({currentUser.id})
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1 flex items-center gap-2.5">
            {sample?.sampleName || 'Loading Sample...'}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
            <div className="flex items-center gap-1.5 font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800">
              <span>{sampleId}</span>
              <button
                type="button"
                onClick={() => handleCopy(sampleId)}
                className="text-zinc-500 hover:text-zinc-300"
                title="Copy Sample ID"
              >
                {copiedId === sampleId ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>

            {sample && (
              <>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <span>Owner:</span>
                  <strong className="text-zinc-200">{sample.ownerName}</strong>
                </div>
                <AccessBadge isOwner={sample.isOwner} hasAccess={sample.hasAccess} />
              </>
            )}
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchSample}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Files
          </button>

          {sample?.isOwner ? (
            <Link
              href={`/samples/${sampleId}/access`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-lg shadow-indigo-600/30 transition-all"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Manage Access
            </Link>
          ) : (
            <Link
              href={`/samples/${sampleId}/access`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors"
            >
              <Info className="h-3.5 w-3.5" />
              View Access Roster
            </Link>
          )}
        </div>
      </div>

      {/* Permission Explanation Box */}
      <div className="mt-6 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-300 space-y-1">
            <p className="font-semibold text-zinc-200">
              Access Control & QC Rule Verification Matrix:
            </p>
            <p className="text-zinc-400">
              • Download URLs are issued <strong className="text-emerald-400">only</strong> when File QC status is{' '}
              <span className="text-emerald-400 font-mono">passed</span> AND you are either the{' '}
              <strong className="text-zinc-200">Owner</strong> or a{' '}
              <strong className="text-zinc-200">Granted Collaborator</strong>.
            </p>
            <p className="text-zinc-400">
              • Downloading is strictly blocked (HTTP 403) while QC status is{' '}
              <span className="text-amber-400 font-mono">pending</span> or{' '}
              <span className="text-rose-400 font-mono">failed</span>, or if access is restricted.
            </p>
          </div>
        </div>
      </div>

      {/* Action Error Banner */}
      {actionError && (
        <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-xs text-rose-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Files Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-xl">
        <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-950/40 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-400" />
              Attached Sequencing Files ({sample?.files?.length || 0})
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Review quality control status and request time-limited download URLs.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-950/70 text-zinc-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">File Name & Format</th>
                <th className="px-5 py-3.5">File ID</th>
                <th className="px-5 py-3.5">QC Pipeline Status</th>
                <th className="px-5 py-3.5">Download Eligibility</th>
                <th className="px-5 py-3.5 text-center">QC Pipeline Action</th>
                <th className="px-5 py-3.5 text-right">Download Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
                      Loading sample files...
                    </div>
                  </td>
                </tr>
              ) : !sample || sample.files.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <p className="text-sm">No files registered under this sample.</p>
                  </td>
                </tr>
              ) : (
                sample.files.map((file) => {
                  const isEligible = file.canDownload;
                  const isUpdating = updatingFileId === file.fileId;
                  const isRequesting = requestingFileId === file.fileId;

                  let eligibilityReason = 'Authorized (Passed + Permitted)';
                  if (!sample.hasAccess) eligibilityReason = 'Blocked: Lacks access permission';
                  else if (file.qcStatus === 'pending') eligibilityReason = 'Blocked: QC in progress';
                  else if (file.qcStatus === 'failed') eligibilityReason = 'Blocked: QC failed';

                  return (
                    <tr key={file.fileId} className="hover:bg-zinc-800/30 transition-colors">
                      {/* Name & format badge */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          {getFileIcon(file.fileName)}
                          <span className="font-mono font-medium text-zinc-200">{file.fileName}</span>
                        </div>
                      </td>

                      {/* File ID */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
                          <span>{file.fileId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(file.fileId)}
                            className="text-zinc-600 hover:text-zinc-300"
                            title="Copy File ID"
                          >
                            {copiedId === file.fileId ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* QC Status */}
                      <td className="px-5 py-4">
                        <QCBadge status={file.qcStatus} />
                      </td>

                      {/* Download Eligibility */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs ${
                            isEligible ? 'text-emerald-400 font-medium' : 'text-zinc-500'
                          }`}
                        >
                          {isEligible ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Lock className="h-3.5 w-3.5 text-zinc-500" />
                          )}
                          {eligibilityReason}
                        </span>
                      </td>

                      {/* Pipeline QC Simulator Buttons */}
                      <td className="px-5 py-4 text-center">
                        {currentUser.isPipeline ? (
                          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-zinc-950 border border-zinc-800">
                            <button
                              type="button"
                              onClick={() => handleQCStatusChange(file.fileId, 'passed')}
                              disabled={isUpdating || file.qcStatus === 'passed'}
                              title="Update QC status to passed"
                              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                                file.qcStatus === 'passed'
                                  ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                                  : 'text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800'
                              } disabled:opacity-40`}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Pass
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQCStatusChange(file.fileId, 'failed')}
                              disabled={isUpdating || file.qcStatus === 'failed'}
                              title="Update QC status to failed"
                              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                                file.qcStatus === 'failed'
                                  ? 'bg-rose-500/20 text-rose-300 font-bold'
                                  : 'text-zinc-400 hover:text-rose-400 hover:bg-zinc-800'
                              } disabled:opacity-40`}
                            >
                              <XCircle className="h-3 w-3" />
                              Fail
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-500">QC Pipeline only</span>
                        )}
                      </td>

                      {/* Download Action */}
                      <td className="px-5 py-4 text-right">
                        {isEligible ? (
                          <button
                            type="button"
                            onClick={() => handleDownloadRequest(file.fileId, file.fileName)}
                            disabled={isRequesting}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                          >
                            {isRequesting ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
                            )}
                            Request Download
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            title={
                              !sample.hasAccess
                                ? 'Download blocked: You lack permission on this sample.'
                                : file.qcStatus === 'pending'
                                ? 'Download blocked: File QC is still pending.'
                                : 'Download blocked: File QC failed.'
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/40 text-zinc-500 text-xs font-medium border border-zinc-800 cursor-not-allowed"
                          >
                            <Lock className="h-3.5 w-3.5 text-zinc-600" />
                            Download Blocked
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Download Modal Dialog */}
      <DownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        downloadData={activeDownloadData}
        fileName={activeDownloadFileName}
      />
    </div>
  );
}
