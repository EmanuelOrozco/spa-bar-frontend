'use client';

import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/RouteGuards';
import { AppShell } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/AuthLayout';
import { StatCard, Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState, ErrorState } from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useDashboardStats } from '@/hooks/useOrders';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency, formatTime, formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/lib/schemas';
import { DollarSign, ShoppingBag, Users, AlertTriangle } from 'lucide-react';

function statusVariant(status: string) {
  if (status === 'DELIVERED') return 'success' as const;
  if (status === 'CANCELLED') return 'danger' as const;
  return 'warning' as const;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading, error, refetch } = useDashboardStats();
  const { data: ordersData } = useOrders({ page: 1, limit: 5 });
  const { data: lowStockData } = useProducts({ page: 1, limit: 3, lowStock: true });

  return (
    <ProtectedRoute>
      <AppShell>
        <PageHeader
          title={`Hola, ${user?.name.split(' ')[0]}`}
          subtitle={`Resumen del turno · ${formatDate(new Date().toISOString())}`}
        />

        {isLoading && <LoadingState />}
        {error && <ErrorState message="Error al cargar estadísticas" onRetry={() => refetch()} />}

        {stats && (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={<DollarSign className="h-6 w-6" />}
                label="Ventas totales (Hoy)"
                value={formatCurrency(stats.todaySales)}
                trend="▲ activo"
              />
              <StatCard
                icon={<ShoppingBag className="h-6 w-6" />}
                label="Pedidos Completados"
                value={stats.todayOrders}
              />
              <StatCard
                icon={<Users className="h-6 w-6" />}
                label="Staff Activo"
                value={stats.activeStaff}
              />
              <StatCard
                icon={<AlertTriangle className="h-6 w-6" />}
                label="Alertas de Stock"
                value={stats.lowStockCount}
                badge={
                  stats.lowStockCount > 0 ? <Badge variant="danger">Acción req.</Badge> : undefined
                }
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-white">Pedidos Recientes</h3>
                  <Link href="/ventas" className="text-xs text-brand-500 hover:underline">
                    Ver todos →
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs uppercase text-muted">
                        <th className="pb-3 pr-4">ID</th>
                        <th className="pb-3 pr-4">Mesa</th>
                        <th className="pb-3 pr-4">Items</th>
                        <th className="pb-3 pr-4">Total</th>
                        <th className="pb-3 pr-4">Estado</th>
                        <th className="pb-3">Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordersData?.data.map((order) => (
                        <tr key={order.id} className="border-b border-border/50">
                          <td className="py-3 pr-4 text-muted">#{order.orderNumber}</td>
                          <td className="py-3 pr-4">{order.tableName ?? '—'}</td>
                          <td className="py-3 pr-4 text-muted">
                            {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                          </td>
                          <td className="py-3 pr-4 font-medium">{formatCurrency(order.total)}</td>
                          <td className="py-3 pr-4">
                            <Badge variant={statusVariant(order.status)}>
                              {ORDER_STATUS_LABELS[order.status]}
                            </Badge>
                          </td>
                          <td className="py-3 text-muted">{formatTime(order.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card>
                <h3 className="mb-4 font-semibold text-white">Estado del Local</h3>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted">Ocupación</span>
                  <span className="text-brand-500">{stats.occupancyRate}%</span>
                </div>
                <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all"
                    style={{ width: `${stats.occupancyRate}%` }}
                  />
                </div>
                <p className="mb-4 text-sm text-muted">
                  Ticket promedio: {formatCurrency(stats.avgTicket)}
                </p>
                <Link
                  href="/mesas"
                  className="block rounded-lg bg-brand-500 py-2.5 text-center text-sm font-semibold text-black transition-all hover:brightness-110"
                >
                  + Nueva Reserva
                </Link>
              </Card>

              <Card>
                <h3 className="mb-4 font-semibold text-white">Alertas de Inventario</h3>
                <div className="space-y-3">
                  {lowStockData?.data.map((product) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-danger" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted">{product.unit}</p>
                      </div>
                      <Badge variant="danger">Quedan {product.stock}</Badge>
                    </div>
                  ))}
                  {!lowStockData?.data.length && (
                    <p className="text-sm text-muted">Sin alertas de stock</p>
                  )}
                </div>
                <Link
                  href="/inventario"
                  className="mt-4 block rounded-lg border border-border py-2 text-center text-sm hover:bg-white/5"
                >
                  Gestionar Stock
                </Link>
              </Card>
            </div>
          </>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
