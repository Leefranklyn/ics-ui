'use client';

import { createContext, useState, useCallback, ReactNode } from 'react';
import { AuthState, TokenPayload } from '@/types';
import { decodeToken } from '@/lib/auth';

export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser]   = useState<TokenPayload | null>(null);

  const login = useCallback((newToken: string) => {
    setToken(newToken);
    setUser(decodeToken(newToken));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
