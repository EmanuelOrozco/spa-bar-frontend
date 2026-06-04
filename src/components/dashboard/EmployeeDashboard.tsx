'use client';

import Link from 'next/link';
import { StatCard, Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState, ErrorState } from '@/components/ui/Spinner';
import { useOrderStats, useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency, formatTime, formatDate } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/lib/schemas';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Ticket,
  Plus,
  Wine,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';

function statusVariant(status: string) {
  if (status === 'DELIVERED') return 'success' as const;
  if (status === 'CANCELLED') return 'danger' as const;
  return 'warning' as const;
}

interface EmployeeDashboardProps {
  userName: string;
}

export function EmployeeDashboard({ userName }: EmployeeDashboardProps) {
  const firstName = userName.split(' ')[0];
  const { data: stats, isLoading, error, refetch } = useOrderStats();
  const { data: ordersData } = useOrders({ page: 1, limit: 8 });
  const { data: lowStockData } = useProducts({
    page: 1,
    limit: 5,
    lowStock: true,
    isMenuItem: true,
  });

  const activeOrders =
    ordersData?.data.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length ??
    0;

  return (
    <>
      <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-500">Mi turno</p>
          <h2 className="text-2xl font-bold text-white">Hola, {firstName}</h2>
          <p className="text-sm text-muted">
            Resumen de tu actividad · {formatDate(new Date().toISOString())}
          </p>
        </div>
        <Link
          href="/ventas"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-black transition-all hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Nuevo pedido
        </Link>
      </div>

      {isLoading && <LoadingState />}
      {error && <ErrorState message="Error al cargar tus estadísticas" onRetry={() => refetch()} />}

      {stats && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<DollarSign className="h-6 w-6" />}
              label="Mis ventas (hoy)"
              value={formatCurrency(stats.todaySales)}
            />
            <StatCard
              icon={<ShoppingBag className="h-6 w-6" />}
              label="Pedidos registrados hoy"
              value={stats.todayOrders}
              trend={activeOrders > 0 ? `${activeOrders} en curso` : undefined}
            />
            <StatCard
              icon={<TrendingUp className="h-6 w-6" />}
              label="Mis ventas (7 días)"
              value={formatCurrency(stats.weekSales)}
            />
            <StatCard
              icon={<Ticket className="h-6 w-6" />}
              label="Ticket promedio"
              value={formatCurrency(stats.avgTicket)}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-brand-500" />
                  <h3 className="font-semibold text-white">Mis pedidos recientes</h3>
                </div>
                <Link href="/ventas" className="text-xs text-brand-500 hover:underline">
                  Ver todos →
                </Link>
              </div>
              {!ordersData?.data.length ? (
                <p className="py-6 text-center text-sm text-muted">
                  Aún no tienes pedidos. Crea el primero desde Ventas.
                </p>
              ) : (
                <div className="space-y-2">
                  {ordersData.data.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-black/20 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-white">
                          #{order.orderNumber}
                          <span className="ml-2 text-sm font-normal text-muted">
                            {order.tableName ?? 'Barra'}
                          </span>
                        </p>
                        <p className="text-xs text-muted">{formatTime(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-brand-500">
                          {formatCurrency(order.total)}
                        </span>
                        <Badge variant={statusVariant(order.status)}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div className="space-y-4">
              <Card>
                <h3 className="mb-4 font-semibold text-white">Accesos rápidos</h3>
                <div className="grid gap-2">
                  <Link
                    href="/ventas"
                    className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:bg-white/5"
                  >
                    <Plus className="h-4 w-4 text-brand-500" />
                    Registrar venta
                  </Link>
                  <Link
                    href="/menu"
                    className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:bg-white/5"
                  >
                    <Wine className="h-4 w-4 text-brand-500" />
                    Consultar menú
                  </Link>
                  <Link
                    href="/mesas"
                    className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:bg-white/5"
                  >
                    <ClipboardList className="h-4 w-4 text-brand-500" />
                    Mesas y reservas
                  </Link>
                  <Link
                    href="/inventario"
                    className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:bg-white/5"
                  >
                    <AlertTriangle className="h-4 w-4 text-brand-500" />
                    Ver inventario
                  </Link>
                </div>
              </Card>

              <Card>
                <h3 className="mb-4 font-semibold text-white">Stock del menú</h3>
                <p className="mb-3 text-xs text-muted">
                  Solo consulta. El inventario se descuenta al entregar pedidos.
                </p>
                <div className="space-y-2">
                  {lowStockData?.data.map((product) => (
                    <div key={product.id} className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm">{product.name}</p>
                      <Badge variant="danger">
                        {product.stock} {product.unit}
                      </Badge>
                    </div>
                  ))}
                  {!lowStockData?.data.length && (
                    <p className="text-sm text-muted">Sin alertas en productos del menú</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
