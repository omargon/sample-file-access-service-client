'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '../types';
import { api } from '../lib/api';

const DEFAULT_USERS: User[] = [
  { id: 'user-1', name: 'User 1', apiKey: 'user1-key' },
  { id: 'user-2', name: 'User 2', apiKey: 'user2-key' },
  { id: 'pipeline-user', name: 'QC Pipeline', apiKey: 'pipeline-key', isPipeline: true },
];

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  logout: () => void;
  availableUsers: User[];
  isLoading: boolean;
  backendConnected: boolean;
  refreshUsers: () => Promise<void>;
  resetDemoData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [availableUsers, setAvailableUsers] = useState<User[]>(DEFAULT_USERS);
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const users = await api.getUsers();
      if (users && users.length > 0) {
        setAvailableUsers(users);
        setBackendConnected(true);
      }
    } catch (err) {
      console.warn('Backend not yet reachable on /users, using fallback users:', err);
      setBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const setCurrentUser = useCallback((user: User) => setCurrentUserState(user), []);
  const logout = useCallback(() => setCurrentUserState(null), []);

  const resetDemoData = useCallback(async () => {
    await api.resetAndSeed();
    await fetchUsers();
  }, [fetchUsers]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        logout,
        availableUsers,
        isLoading,
        backendConnected,
        refreshUsers: fetchUsers,
        resetDemoData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthBoundary({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';
  const needsRedirect = isLoginPage ? Boolean(currentUser) : !currentUser;

  useEffect(() => {
    if (!needsRedirect) return;
    router.replace(currentUser ? '/samples' : '/login');
  }, [currentUser, needsRedirect, router]);

  if (needsRedirect) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useCurrentUser(): User {
  const { currentUser } = useAuth();
  if (!currentUser) {
    throw new Error('useCurrentUser must be used within an authenticated page');
  }
  return currentUser;
}
