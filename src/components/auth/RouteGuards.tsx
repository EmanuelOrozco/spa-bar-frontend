'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { LoadingState } from '@/components/ui/Spinner';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <LoadingState />;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <LoadingState />;
  if (isAuthenticated) return null;

  return <>{children}</>;
}

export function RoleGuard({ children, role = 'admin' }: { children: ReactNode; role?: 'admin' }) {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && role === 'admin' && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [isAdmin, isLoading, role, router]);

  if (isLoading) return <LoadingState />;
  if (role === 'admin' && !isAdmin) return null;

  return <>{children}</>;
}
