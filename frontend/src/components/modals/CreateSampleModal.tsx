'use client';

import React, { useState } from 'react';
import { useCurrentUser } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { X, Plus, FileText, Loader2, Sparkles } from 'lucide-react';

interface CreateSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const QUICK_SUGGESTIONS = [
  'tumor_wgs_alignment.bam',
  'germline_normal.bam',
  'somatic_variants.vcf.gz',
  'transcriptome_counts.tsv',
  'qc_coverage_report.pdf',
];

export function CreateSampleModal({ isOpen, onClose, onSuccess }: CreateSampleModalProps) {
  const currentUser = useCurrentUser();
  const [sampleName, setSampleName] = useState('');
  const [files, setFiles] = useState<string[]>(['tumor_reads.bam', 'rnaseq_panel.fastq.gz']);
  const [newFileName, setNewFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddFile = (fileNameToAdd?: string) => {
    const target = (fileNameToAdd || newFileName).trim();
    if (!target) return;
    if (files.includes(target)) {
      setError(`File "${target}" is already in the list.`);
      return;
    }
    setFiles([...files, target]);
    if (!fileNameToAdd) setNewFileName('');
    setError(null);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sampleName.trim()) {
      setError('Please provide a sample name');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await api.createSample(currentUser.apiKey, sampleName.trim(), files);
      setSampleName('');
      setFiles(['tumor_reads.bam']);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">Register New Sample</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Creating as <span className="text-indigo-400 font-mono font-medium">{currentUser.name}</span> ({currentUser.id})
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Sample Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={sampleName}
              onChange={(e) => setSampleName(e.target.value)}
              placeholder="e.g. Colorectal Adenocarcinoma Cohort #04"
              className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Attach Initial Files (QC will start as <span className="text-amber-400 font-mono">pending</span>)
            </label>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              <span className="text-[11px] text-zinc-500 flex items-center gap-1 self-center mr-1">
                <Sparkles className="h-3 w-3 text-indigo-400" /> Presets:
              </span>
              {QUICK_SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleAddFile(sug)}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 transition-colors"
                >
                  +{sug.split('_')[0]}
                </button>
              ))}
            </div>

            {/* Input to add custom file */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFile();
                    }
                  }}
                  placeholder="e.g. sequence_reads.bam"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddFile()}
                className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1 border border-zinc-700"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>

            {/* File List Chips */}
            <div className="mt-2.5 max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {files.length === 0 ? (
                <p className="text-xs text-zinc-500 italic py-2">No files attached (sample will be created empty)</p>
              ) : (
                files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs font-mono text-zinc-300"
                  >
                    <span className="truncate mr-2">{file}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="text-zinc-500 hover:text-rose-400 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Register Sample ({files.length} {files.length === 1 ? 'file' : 'files'})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
