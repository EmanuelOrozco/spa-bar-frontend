'use client';

import Link from 'next/link';
import { StatCard, Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState, ErrorState } from '@/components/ui/Spinner';
import { AdminOperationalMetrics } from '@/components/admin/AdminOperationalMetrics';
import { useDashboardStats, useOrders } from '@/hooks/useOrders';
import { useUsers } from '@/hooks/useUsers';
import { useProducts } from '@/hooks/useProducts';
import { useTables, useReservations } from '@/hooks/useTables';
import { formatCurrency, formatTime } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/lib/schemas';
import { Order, OrderStatus } from '@/types';
import {
  TrendingUp,
  Users,
  Package,
  AlertTriangle,
  CalendarDays,
  LayoutGrid,
  Clock,
  CheckCircle2,
  XCircle,
  UserCircle,
  Shield,
} from 'lucide-react';

const ACTIVE_STATUSES: OrderStatus[] = ['PENDING', 'PREPARING_BAR', 'PREPARING_KITCHEN'];

function statusVariant(status: string) {
  if (status === 'DELIVERED') return 'success' as const;
  if (status === 'CANCELLED') return 'danger' as const;
  return 'warning' as const;
}

function buildTopProducts(orders: Order[], limit = 5) {
  const map = new Map<string, { name: string; qty: number; revenue: number }>();
  orders.forEach((order) => {
    if (order.status === 'CANCELLED') return;
    order.items.forEach((item) => {
      const current = map.get(item.productId) ?? {
        name: item.productName,
        qty: 0,
        revenue: 0,
      };
      map.set(item.productId, {
        name: item.productName,
        qty: current.qty + item.quantity,
        revenue: current.revenue + item.subtotal,
      });
    });
  });
  return Array.from(map.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit);
}

function countByStatus(orders: Order[]) {
  const counts: Record<OrderStatus, number> = {
    PENDING: 0,
    PREPARING_BAR: 0,
    PREPARING_KITCHEN: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };
  orders.forEach((o) => {
    counts[o.status] += 1;
  });
  return counts;
}

export function AdminDashboard() {
  const { data: stats, isLoading, error, refetch } = useDashboardStats();
  const { data: ordersData } = useOrders({ page: 1, limit: 100 });
  const { data: users } = useUsers({ page: 1, limit: 100 });
  const { data: products } = useProducts({ page: 1, limit: 100 });
  const { data: tablesData } = useTables({ page: 1, limit: 50 });
  const { data: reservationsData } = useReservations({ page: 1, limit: 50 });

  const orders = ordersData?.data ?? [];
  const statusCounts = countByStatus(orders);
  const topProducts = buildTopProducts(orders);
  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length;
  const deliveredToday = orders.filter((o) => {
    if (o.status !== 'DELIVERED') return false;
    const d = new Date(o.createdAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const adminCount = users?.data.filter((u) => u.role === 'admin').length ?? 0;
  const employeeCount = users?.data.filter((u) => u.role === 'employee').length ?? 0;
  const menuProducts = products?.data.filter((p) => p.isMenuItem).length ?? 0;
  const reservationsToday =
    reservationsData?.data.filter((r) => {
      const d = new Date(r.reservedAt);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    }).length ?? 0;

  return (
    <>
      <div className="mb-2">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-500">Administración</p>
        <h2 className="text-2xl font-bold text-white">Panel de control</h2>
        <p className="text-sm text-muted">
          Vista global del negocio — ventas, operación, equipo e inventario
        </p>
      </div>

      {isLoading && <LoadingState />}
      {error && <ErrorState message="Error al cargar estadísticas" onRetry={() => refetch()} />}

      {stats && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<TrendingUp className="h-6 w-6" />}
              label="Ventas semanales"
              value={formatCurrency(stats.weekSales)}
              trend={stats.todaySales > 0 ? `Hoy ${formatCurrency(stats.todaySales)}` : undefined}
            />
            <StatCard
              icon={<Users className="h-6 w-6" />}
              label="Equipo registrado"
              value={users?.meta.total ?? 0}
              badge={
                <Badge variant="success">
                  {adminCount} admin · {employeeCount} staff
                </Badge>
              }
            />
            <StatCard
              icon={<Package className="h-6 w-6" />}
              label="Catálogo"
              value={products?.meta.total ?? 0}
              trend={`${menuProducts} en menú`}
            />
            <StatCard
              icon={<AlertTriangle className="h-6 w-6" />}
              label="Alertas de stock"
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<LayoutGrid className="h-6 w-6" />}
              label="Mesas"
              value={tablesData?.meta.total ?? 0}
              trend={`${stats.occupancyRate}% ocupación`}
            />
            <StatCard
              icon={<CalendarDays className="h-6 w-6" />}
              label="Reservas hoy"
              value={reservationsToday}
              trend={`${reservationsData?.meta.total ?? 0} totales`}
            />
            <StatCard
              icon={<Clock className="h-6 w-6" />}
              label="Pedidos en curso"
              value={activeOrders}
              trend={`${stats.todayOrders} pedidos hoy`}
            />
            <StatCard
              icon={<CheckCircle2 className="h-6 w-6" />}
              label="Entregados hoy"
              value={deliveredToday}
              trend={`Ticket ${formatCurrency(stats.avgTicket)}`}
            />
          </div>

          <AdminOperationalMetrics stats={stats} tables={tablesData?.data} orders={orders} />

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h3 className="mb-4 font-semibold text-white">Pedidos por estado</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {(Object.keys(statusCounts) as OrderStatus[]).map((status) => (
                  <div
                    key={status}
                    className="flex items-center justify-between rounded-xl border border-border bg-black/20 px-4 py-3"
                  >
                    <span className="text-sm text-muted">{ORDER_STATUS_LABELS[status]}</span>
                    <span className="text-lg font-bold text-white">{statusCounts[status]}</span>
                  </div>
                ))}
              </div>
              {statusCounts.CANCELLED > 0 && (
                <p className="mt-3 flex items-center gap-2 text-xs text-danger">
                  <XCircle className="h-3.5 w-3.5" />
                  {statusCounts.CANCELLED} pedido(s) cancelado(s) en el listado actual
                </p>
              )}
            </Card>

            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-white">Productos más vendidos</h3>
                <span className="text-xs text-muted">Según pedidos cargados</span>
              </div>
              {topProducts.length === 0 ? (
                <p className="text-sm text-muted">Sin datos de ventas aún</p>
              ) : (
                <ul className="space-y-3">
                  {topProducts.map((item, index) => (
                    <li
                      key={item.name}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-black/20 px-4 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 text-xs font-bold text-brand-500">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">{item.name}</p>
                          <p className="text-xs text-muted">{item.qty} unidades</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-brand-500">
                        {formatCurrency(item.revenue)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-white">Últimos pedidos (todos)</h3>
              <Link href="/ventas" className="text-xs text-brand-500 hover:underline">
                Ir a ventas →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase text-muted">
                    <th className="pb-3 pr-4">#</th>
                    <th className="pb-3 pr-4">Mesero</th>
                    <th className="pb-3 pr-4">Mesa</th>
                    <th className="pb-3 pr-4">Total</th>
                    <th className="pb-3 pr-4">Estado</th>
                    <th className="pb-3">Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 8).map((order) => (
                    <tr key={order.id} className="border-b border-border/50">
                      <td className="py-3 pr-4 text-muted">#{order.orderNumber}</td>
                      <td className="py-3 pr-4">{order.userName}</td>
                      <td className="py-3 pr-4">{order.tableName ?? 'Barra'}</td>
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
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-white">Equipo del sistema</h3>
              <Link href="/staff" className="text-xs text-brand-500 hover:underline">
                Gestionar staff →
              </Link>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {users?.data.slice(0, 8).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-black/20 px-4 py-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
                    {user.role === 'admin' ? (
                      <Shield className="h-5 w-5" />
                    ) : (
                      <UserCircle className="h-5 w-5" />
                    )}
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

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: '/ventas', label: 'Ventas y pedidos' },
              { href: '/inventario', label: 'Inventario' },
              { href: '/menu', label: 'Menú y productos' },
              { href: '/mesas', label: 'Mesas y reservas' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-border bg-black/20 px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:border-brand-500/30 hover:bg-brand-500/5"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
