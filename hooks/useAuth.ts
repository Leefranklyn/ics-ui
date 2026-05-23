'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import { Role } from '@/types';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function useRequireAuth(...allowedRoles: Role[]) {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
      return;
    }
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      router.replace('/login');
    }
  }, [isLoggedIn, user, router]);

  return { isLoggedIn, user };
}
