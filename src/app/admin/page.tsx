'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute, RoleGuard } from '@/components/auth/RouteGuards';
import { LoadingState } from '@/components/ui/Spinner';

/** Redirige al panel admin integrado en /dashboard */
function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return <LoadingState />;
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <RoleGuard>
        <AdminRedirect />
      </RoleGuard>
    </ProtectedRoute>
  );
}
