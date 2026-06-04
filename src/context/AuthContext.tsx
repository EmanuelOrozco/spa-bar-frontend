'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { PublicUser } from '@/types';
import { authService } from '@/services/auth.service';
import { clearTokens, getStoredToken, setTokens } from '@/services/http';

interface AuthContextValue {
  user: PublicUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: PublicUser) => void;
  updateSession: (accessToken: string, refreshToken: string, user: PublicUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function hydrateSession() {
      const token = getStoredToken();
      if (!token) {
        clearTokens();
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const me = await authService.getMe();
        if (!cancelled) {
          localStorage.setItem('spa-bar-user', JSON.stringify(me));
          setUser(me);
        }
      } catch {
        clearTokens();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    hydrateSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((accessToken: string, refreshToken: string, userData: PublicUser) => {
    setTokens(accessToken, refreshToken);
    localStorage.setItem('spa-bar-user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const updateSession = useCallback(
    (accessToken: string, refreshToken: string, userData: PublicUser) => {
      setTokens(accessToken, refreshToken);
      localStorage.setItem('spa-bar-user', JSON.stringify(userData));
      setUser(userData);
    },
    []
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && getStoredToken()),
      isAdmin: user?.role === 'admin',
      isLoading,
      login,
      updateSession,
      logout,
    }),
    [user, isLoading, login, updateSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
