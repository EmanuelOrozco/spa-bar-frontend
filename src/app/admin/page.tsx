'use client';

import { ProtectedRoute, RoleGuard } from '@/components/auth/RouteGuards';
import { AppShell } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/AuthLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/Spinner';
import { AdminOperationalMetrics } from '@/components/admin/AdminOperationalMetrics';
import { useDashboardStats } from '@/hooks/useOrders';
import { useUsers } from '@/hooks/useUsers';
import { useProducts } from '@/hooks/useProducts';
import { useTables } from '@/hooks/useTables';
import { formatCurrency } from '@/lib/utils';
import { Shield, Users, Package, TrendingUp, UserCircle } from 'lucide-react';

export default function AdminPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: users } = useUsers({ page: 1, limit: 100 });
  const { data: products } = useProducts({ page: 1, limit: 100 });
  const { data: tablesData } = useTables({ page: 1, limit: 50 });

  const adminCount = users?.data.filter((u) => u.role === 'admin').length ?? 0;
  const employeeCount = users?.data.filter((u) => u.role === 'employee').length ?? 0;

  return (
    <ProtectedRoute>
      <RoleGuard role="admin">
        <AppShell>
          <PageHeader
            title="Panel de Administración"
            subtitle="Vista global del sistema de gestión"
          />

          {isLoading && <LoadingState />}

          {stats && (
            <div className="page-enter grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  icon={<TrendingUp className="h-6 w-6" />}
                  label="Ventas Semanales"
                  value={formatCurrency(stats.weekSales)}
                  trend={
                    stats.todaySales > 0 ? `Hoy ${formatCurrency(stats.todaySales)}` : undefined
                  }
                />
                <StatCard
                  icon={<Users className="h-6 w-6" />}
                  label="Usuarios Activos"
                  value={users?.meta.total ?? 0}
                  badge={
                    <Badge variant="success">
                      {adminCount} admin · {employeeCount} staff
                    </Badge>
                  }
                />
                <StatCard
                  icon={<Package className="h-6 w-6" />}
                  label="Productos"
                  value={products?.meta.total ?? 0}
                />
                <StatCard
                  icon={<Shield className="h-6 w-6" />}
                  label="Alertas Stock"
                  value={stats.lowStockCount}
                  badge={
                    stats.lowStockCount > 0 ? (
                      <Badge variant="danger">Revisar</Badge>
                    ) : (
                      <Badge variant="success">OK</Badge>
                    )
                  }
                />
              </div>

              <AdminOperationalMetrics stats={stats} tables={tablesData?.data} />

              <Card>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-white">Usuarios del Sistema</h3>
                  <span className="text-xs text-muted">{users?.meta.total ?? 0} registrados</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {users?.data.slice(0, 8).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-black/20 px-4 py-3 transition-colors hover:bg-white/[0.03]"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
                        <UserCircle className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{user.name}</p>
                        <p className="truncate text-xs text-muted">{user.position ?? user.email}</p>
                      </div>
                      <Badge variant={user.role === 'admin' ? 'warning' : 'success'}>
                        {user.role === 'admin' ? 'Admin' : 'Staff'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </AppShell>
      </RoleGuard>
    </ProtectedRoute>
  );
}
