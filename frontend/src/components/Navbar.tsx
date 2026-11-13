'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Dna, Database, Layers, LogOut } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, backendConnected, resetDemoData } = useAuth();
  const [isResetting, setIsResetting] = React.useState(false);

  const handleReset = async () => {
    if (confirm('Reset and reseed sample database with initial demo data?')) {
      try {
        setIsResetting(true);
        await resetDemoData();
        window.location.reload();
      } catch (err) {
        alert('Failed to reset demo data: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href={currentUser ? '/samples' : '/login'} className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Dna className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-semibold text-zinc-100 group-hover:text-white transition-colors">
                SampleAccess
              </span>
              <span className="ml-1.5 inline-block rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-mono text-indigo-400 border border-indigo-500/20">
                POC
              </span>
            </div>
          </Link>

          {currentUser && (
            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-zinc-800">
              <Link
                href="/samples"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  pathname.startsWith('/samples')
                    ? 'bg-zinc-800/80 text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Layers className="h-4 w-4" />
                Samples & Files
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-400"
            title={backendConnected ? 'Backend service online (:3001)' : 'Backend offline or connecting...'}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{backendConnected ? 'API Connected' : 'Connecting'}</span>
          </div>

          {currentUser && (
            <>
              <button
                onClick={handleReset}
                disabled={isResetting}
                title="Reseed database with fresh demo samples and files"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors disabled:opacity-50"
              >
                <Database className="h-3.5 w-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Reset Seed Data</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
