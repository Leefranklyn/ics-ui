'use client';

import { useContext, useEffect, useState } from 'react';
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
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for component to be hydrated
    setIsChecking(false);

    if (!isLoggedIn) {
      router.replace('/login');
      return;
    }
    
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      router.replace('/dashboard');
    }
  }, [isLoggedIn, user, router, allowedRoles]);

  return { isLoggedIn, user, isChecking };
}
