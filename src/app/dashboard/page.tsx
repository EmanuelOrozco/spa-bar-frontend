'use client';

import { ProtectedRoute } from '@/components/auth/RouteGuards';
import { AppShell } from '@/components/layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();

  return (
    <ProtectedRoute>
      <AppShell>
        {isAdmin ? <AdminDashboard /> : <EmployeeDashboard userName={user?.name ?? 'Usuario'} />}
      </AppShell>
    </ProtectedRoute>
  );
}
