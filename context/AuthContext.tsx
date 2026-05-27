'use client';

import { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { AuthState, TokenPayload } from '@/types';
import { decodeToken } from '@/lib/auth';

export const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = 'ics_auth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<TokenPayload | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEY);
      if (storedToken) {
        const decoded = decodeToken(storedToken);
        // Check if token is expired
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem(STORAGE_KEY);
        } else {
          setToken(storedToken);
          setUser(decoded);
        }
      }
    } catch (error) {
      // Invalid token in storage, clear it
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsHydrated(true);
  }, []);

  const login = useCallback((newToken: string) => {
    try {
      const decoded = decodeToken(newToken);
      setToken(newToken);
      setUser(decoded);
      localStorage.setItem(STORAGE_KEY, newToken);
    } catch (error) {
      console.error('Failed to decode token:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Don't render children until hydrated to avoid hydration mismatch
  if (!isHydrated) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
