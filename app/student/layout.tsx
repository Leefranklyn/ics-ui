'use client';

import React from 'react';
import { useAuth, useRequireAuth } from '@/hooks/useAuth';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user, logout } = useAuth();
  useRequireAuth('student');

  if (!isLoggedIn || !user || user.role !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <header className="bg-surface border-b border-border py-4 px-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-textBase">Welcome, {user.sub}</h1>
          <p className="text-sm text-textMuted">Student Portal</p>
        </div>
        <button 
          onClick={logout}
          className="text-sm font-medium text-danger hover:text-danger/80 transition-colors"
        >
          Logout
        </button>
      </header>
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
