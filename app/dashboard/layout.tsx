'use client';

import React from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import NavBar from '@/components/nav/NavBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user } = useRequireAuth('staff', 'admin');

  if (!isLoggedIn || !user || !['staff', 'admin'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-8 h-8 border-4 border-accent-indigo/30 border-t-accent-indigo rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <NavBar />
      <main className="pt-20 w-full">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
