'use client';

import React, { useState } from 'react';
import { DownloadRequestResponse } from '../../types';
import { X, Copy, Check, ExternalLink, ShieldCheck, Clock, Download } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloadData: DownloadRequestResponse | null;
  fileName?: string;
}

export function DownloadModal({ isOpen, onClose, downloadData, fileName }: DownloadModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !downloadData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(downloadData.downloadURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedExpiration = new Date(downloadData.expiration_timestamp).toLocaleString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Authorized Download URL Generated</h3>
              <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-xs">{fileName || downloadData.fileId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-300 text-xs">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Access verified: Owner / Collaborator authorization & QC status passed.</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Secure Signed URL (Time-Limited)
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  readOnly
                  value={downloadData.downloadURL}
                  className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs font-mono text-zinc-300 select-all focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 border border-zinc-700 transition-all shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <Clock className="h-4 w-4 text-amber-400" />
              <span>Expires at:</span>
            </div>
            <span className="font-mono text-zinc-200">{formattedExpiration}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-[11px] font-mono text-zinc-500">File ID: {downloadData.fileId}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Close
            </button>
            <a
              href={downloadData.downloadURL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-lg shadow-emerald-600/30 transition-all"
            >
              Open URL
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
