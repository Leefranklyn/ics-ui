'use client';

import React from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import NavBar from '@/components/nav/NavBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user } = useRequireAuth('staff', 'admin');

  if (!isLoggedIn || !user || !['staff', 'admin'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
