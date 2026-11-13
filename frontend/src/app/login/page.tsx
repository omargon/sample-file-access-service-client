'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Users,
  Cpu,
  ArrowRight,
  Key,
  CheckCircle2,
  Lock,
  FileCheck,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser, availableUsers } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState('user-1');

  const selectedUser = availableUsers.find((u) => u.id === selectedUserId);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      setCurrentUser(selectedUser);
      router.push('/samples');
    }
  };

  const getPersonaMeta = (userId: string, isPipeline?: boolean) => {
    if (isPipeline) {
      return {
        title: 'QC Sequencing Pipeline',
        subtitle: 'Internal Trusted Service',
        badge: 'Pipeline Worker',
        badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
        icon: <Cpu className="h-6 w-6 text-purple-400" />,
        accentBorder: 'hover:border-purple-500/40',
        permissions: [
          'Can update file QC status (passed / failed)',
          'Cannot download files directly',
          'Identified by trusted x-api-key: pipeline-key',
        ],
      };
    }
    if (userId === 'user-1') {
      return {
        title: 'User 1 (Principal Investigator)',
        subtitle: 'Sample Owner & Research Lead',
        badge: 'Sample Owner',
        badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
        icon: <ShieldCheck className="h-6 w-6 text-indigo-400" />,
        accentBorder: 'hover:border-indigo-500/40',
        permissions: [
          'Full owner rights on cancer cohort samples',
          'Can grant sample access to collaborators',
          'Can request 24h download URLs for passed files',
          'Blocked from downloading pending or failed files',
        ],
      };
    }
    return {
      title: 'User 2 (Bioinformatician)',
      subtitle: 'Collaborating Researcher',
      badge: 'Collaborator',
      badgeColor: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
      icon: <Users className="h-6 w-6 text-sky-400" />,
      accentBorder: 'hover:border-sky-500/40',
      permissions: [
        'Can register own samples & cohorts',
        'Can download passed files only on shared samples',
        'Strictly forbidden from granting access to unowned samples',
        'Access denied on private samples',
      ],
    };
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Sign in</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Choose a user account to access samples and files with its permissions.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mx-auto max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="user-select" className="block text-sm font-medium text-zinc-200 mb-2">
              User account
            </label>
            <div className="relative">
              <select
                id="user-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full appearance-none rounded-xl bg-zinc-950 border border-zinc-700/80 px-4 py-3 text-sm font-medium text-zinc-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id} className="bg-zinc-900 text-zinc-100">
                    {user.name} ({user.id}) — {user.isPipeline ? 'QC Pipeline Specialist' : user.id === 'user-1' ? 'Sample Owner' : 'Collaborator'}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Users loaded from the database: {availableUsers.map(u => u.name).join(', ')}
            </p>
          </div>

          {/* Active Preview Box */}
          {selectedUser && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      selectedUser.isPipeline
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : selectedUser.id === 'user-1'
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                    }`}
                  >
                    {selectedUser.isPipeline ? (
                      <Cpu className="h-5 w-5" />
                    ) : selectedUser.id === 'user-1' ? (
                      <ShieldCheck className="h-5 w-5" />
                    ) : (
                      <Users className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100">{selectedUser.name}</h3>
                    <p className="text-xs text-zinc-400 font-mono">ID: {selectedUser.id}</p>
                  </div>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                    getPersonaMeta(selectedUser.id, selectedUser.isPipeline).badgeColor
                  }`}
                >
                  {getPersonaMeta(selectedUser.id, selectedUser.isPipeline).badge}
                </span>
              </div>

              {/* API Key Header Token */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Key className="h-3.5 w-3.5 text-zinc-500" />
                  <span>x-api-key:</span>
                </div>
                <span className="text-indigo-300 font-semibold">{selectedUser.apiKey}</span>
              </div>

              {/* Permissions List */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Role Capabilities
                </div>
                {getPersonaMeta(selectedUser.id, selectedUser.isPipeline).permissions.map((perm, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedUser}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{selectedUser ? `Sign In as ${selectedUser.name}` : 'No users available'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Persona Quick Selector Grid */}
      <div className="mt-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 text-center mb-4">
          Or click a card to sign in
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableUsers.map((user) => {
            const meta = getPersonaMeta(user.id, user.isPipeline);
            const isSelected = selectedUserId === user.id;

            return (
              <div
                key={user.id}
                onClick={() => {
                  setSelectedUserId(user.id);
                  setCurrentUser(user);
                  router.push('/samples');
                }}
                className={`cursor-pointer group relative rounded-xl border p-5 transition-all ${
                  isSelected
                    ? 'border-indigo-500/50 bg-indigo-500/5 ring-1 ring-indigo-500/30'
                    : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/40 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700/50">
                    {meta.icon}
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${meta.badgeColor}`}>
                    {meta.badge}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white">
                  {user.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">{meta.subtitle}</p>

                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-500">
                  <span>{user.apiKey}</span>
                  <span className="text-indigo-400 font-sans text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Select &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
