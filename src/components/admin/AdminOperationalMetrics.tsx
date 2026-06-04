'use client';

import { DashboardStats, Order, Table, TableStatus } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  CartesianGrid,
} from 'recharts';
import {
  Activity,
  DollarSign,
  Receipt,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  CalendarDays,
} from 'lucide-react';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function buildWeekChart(orders: { total: number; createdAt: string }[]) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  const map = new Map<number, { total: number; orders: number }>();
  for (let i = 0; i < 7; i++) map.set(i, { total: 0, orders: 0 });

  orders.forEach((o) => {
    const date = new Date(o.createdAt);
    if (date < weekAgo) return;
    const day = date.getDay();
    const current = map.get(day)!;
    map.set(day, {
      total: current.total + o.total,
      orders: current.orders + 1,
    });
  });

  return Array.from(map.entries()).map(([day, data]) => ({
    name: DAYS[day],
    total: Math.round(data.total),
    orders: data.orders,
    avgTicket: data.orders > 0 ? Math.round(data.total / data.orders) : 0,
  }));
}

function buildSalesInsights(stats: DashboardStats) {
  const weekDailyAvg = stats.weekSales / 7;
  const diffToday = stats.todaySales - weekDailyAvg;
  const salesTrend = weekDailyAvg > 0 ? (diffToday / weekDailyAvg) * 100 : 0;
  const ticketToday = stats.todayOrders > 0 ? stats.todaySales / stats.todayOrders : 0;
  const shareOfWeek = stats.weekSales > 0 ? (stats.todaySales / stats.weekSales) * 100 : 0;

  let trendText: string;
  if (Math.abs(salesTrend) < 1) {
    trendText = 'Las ventas de hoy están alineadas con el promedio diario de la semana.';
  } else if (salesTrend > 0) {
    trendText = `Hoy facturas ${formatCurrency(Math.abs(diffToday))} más que el promedio diario (${formatCurrency(weekDailyAvg)}). Es un ${salesTrend.toFixed(0)}% por encima del ritmo habitual.`;
  } else {
    trendText = `Hoy facturas ${formatCurrency(Math.abs(diffToday))} menos que el promedio diario (${formatCurrency(weekDailyAvg)}). Es un ${Math.abs(salesTrend).toFixed(0)}% por debajo del ritmo habitual.`;
  }

  return {
    weekDailyAvg,
    diffToday,
    salesTrend,
    ticketToday,
    shareOfWeek,
    trendText,
  };
}

const TABLE_STATUS_LABELS: Record<TableStatus, string> = {
  OCCUPIED: 'Ocupadas',
  AVAILABLE: 'Libres',
  RESERVED: 'Reservadas',
};

const TABLE_STATUS_COLORS: Record<TableStatus, string> = {
  OCCUPIED: '#ef4444',
  AVAILABLE: '#10b981',
  RESERVED: '#0ea5e9',
};

interface AdminOperationalMetricsProps {
  stats: DashboardStats;
  tables?: Table[];
  orders?: Order[];
}

function RadialGauge({ value, label }: { value: number; label: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const tone = value >= 75 ? 'text-danger' : value >= 45 ? 'text-warning' : 'text-success';

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="10"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn('text-brand-500 transition-all duration-700', tone)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{value}%</span>
          <span className="text-xs text-muted">{label}</span>
        </div>
      </div>
    </div>
  );
}

function TrendBadge({ value }: { value: number }) {
  if (Math.abs(value) < 1) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted">
        <Minus className="h-3 w-3" /> estable
      </span>
    );
  }
  const positive = value > 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        positive ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
      )}
    >
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {positive ? '+' : ''}
      {value.toFixed(0)}% vs promedio diario
    </span>
  );
}

function MetricTile({
  icon,
  label,
  value,
  sub,
  help,
  accent = 'brand',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  help?: string;
  accent?: 'brand' | 'info' | 'success' | 'warning';
}) {
  const accents = {
    brand: 'bg-brand-500/10 text-brand-500',
    info: 'bg-info/10 text-info',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <div className="rounded-xl border border-border bg-black/20 p-4">
      <div className="mb-3 flex items-center gap-3">
        <div
          className={cn('flex h-10 w-10 items-center justify-center rounded-lg', accents[accent])}
        >
          {icon}
        </div>
        <span className="text-xs text-muted">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs font-medium text-foreground/80">{sub}</p>}
      {help && <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{help}</p>}
    </div>
  );
}

function WeekChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { payload: { total: number; orders: number; avgTicket: number } }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-[#181a20] px-3 py-2 shadow-xl">
      <p className="mb-1 text-xs font-medium text-white">{label}</p>
      <p className="text-sm font-semibold text-brand-500">{formatCurrency(row.total)}</p>
      <p className="text-[11px] text-muted">
        {row.orders} pedido{row.orders !== 1 ? 's' : ''} · ticket {formatCurrency(row.avgTicket)}
      </p>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: { name: string } }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-[#181a20] px-3 py-2 shadow-xl">
      <p className="mb-1 text-xs text-muted">{label ?? payload[0].payload.name}</p>
      <p className="text-sm font-semibold text-brand-500">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export function AdminOperationalMetrics({
  stats,
  tables = [],
  orders = [],
}: AdminOperationalMetricsProps) {
  const insights = buildSalesInsights(stats);
  const weekChart = buildWeekChart(orders);

  const salesData = [
    {
      name: 'Hoy',
      value: stats.todaySales,
      fill: '#ff9f43',
      hint: 'Suma de pedidos no cancelados desde las 00:00 de hoy.',
    },
    {
      name: 'Prom. diario',
      value: Math.round(insights.weekDailyAvg * 100) / 100,
      fill: '#0ea5e9',
      hint: 'Ventas de los últimos 7 días divididas entre 7 (referencia diaria).',
    },
    {
      name: 'Semana (7d)',
      value: stats.weekSales,
      fill: '#6366f1',
      hint: 'Total acumulado de ingresos en los últimos 7 días calendario.',
    },
  ];

  const tableCounts = tables.reduce(
    (acc, table) => {
      acc[table.status] += 1;
      return acc;
    },
    { OCCUPIED: 0, AVAILABLE: 0, RESERVED: 0 } as Record<TableStatus, number>
  );

  const pieData = (Object.keys(tableCounts) as TableStatus[])
    .filter((status) => tableCounts[status] > 0)
    .map((status) => ({
      name: TABLE_STATUS_LABELS[status],
      value: tableCounts[status],
      fill: TABLE_STATUS_COLORS[status],
      status,
    }));

  const totalTables = tables.length;
  const ordersPerStaff =
    stats.activeStaff > 0 ? (stats.todayOrders / stats.activeStaff).toFixed(1) : '0';

  return (
    <Card className="overflow-hidden">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Rendimiento de ventas</h3>
            <p className="text-xs text-muted">
              Análisis de ingresos, pedidos y ticket — últimos 7 días
            </p>
          </div>
        </div>
        <TrendBadge value={insights.salesTrend} />
      </div>

      <div className="mb-6 rounded-xl border border-brand-500/20 bg-brand-500/5 px-4 py-3">
        <div className="flex gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
          <div className="space-y-2 text-sm text-foreground/90">
            <p>{insights.trendText}</p>
            <p className="text-xs text-muted">
              Hoy representa el{' '}
              <span className="font-medium text-brand-500">{insights.shareOfWeek.toFixed(0)}%</span>{' '}
              de las ventas semanales. Ticket medio de hoy:{' '}
              <span className="font-medium text-white">{formatCurrency(insights.ticketToday)}</span>{' '}
              ({stats.todayOrders} pedido{stats.todayOrders !== 1 ? 's' : ''}).
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-5 xl:col-span-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Ventas por día de la semana
              </p>
            </div>
            <p className="mb-3 text-[11px] text-muted">
              Ingresos agrupados por día (pedidos no cancelados). Identifica qué jornadas generan
              más facturación.
            </p>
            <div className="h-52 rounded-xl border border-border bg-black/20 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(v) => `$${v}`}
                    width={48}
                  />
                  <Tooltip
                    content={<WeekChartTooltip />}
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  />
                  <Bar dataKey="total" fill="#ff9f43" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
              Comparativa rápida
            </p>
            <p className="mb-3 text-[11px] text-muted">
              Contrasta el día actual con el promedio diario y el total de la semana móvil.
            </p>
            <div className="h-56 rounded-xl border border-border bg-black/20 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} barCategoryGap="28%">
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(v) => `$${v}`}
                    width={48}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={56}>
                    {salesData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {salesData.map((item) => (
                <div
                  key={item.name}
                  className="rounded-lg border border-border/60 bg-white/[0.02] px-3 py-2"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-xs font-medium text-white">{item.name}</span>
                  </div>
                  <p className="text-sm font-bold text-brand-500">{formatCurrency(item.value)}</p>
                  <p className="mt-1 text-[10px] leading-snug text-muted">{item.hint}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MetricTile
              icon={<DollarSign className="h-5 w-5" />}
              label="Ingresos de hoy"
              value={formatCurrency(stats.todaySales)}
              sub={`${insights.shareOfWeek.toFixed(0)}% del total semanal`}
              help="Monto facturado hoy por pedidos no cancelados desde las 00:00."
              accent="brand"
            />
            <MetricTile
              icon={<Receipt className="h-5 w-5" />}
              label="Ticket promedio (semana)"
              value={formatCurrency(stats.avgTicket)}
              sub={`Hoy: ${formatCurrency(insights.ticketToday)} por pedido`}
              help="Ingreso promedio por pedido en los últimos 7 días."
              accent="info"
            />
            <MetricTile
              icon={<DollarSign className="h-5 w-5" />}
              label="Ventas semanales (7 días)"
              value={formatCurrency(stats.weekSales)}
              sub={`Promedio diario: ${formatCurrency(insights.weekDailyAvg)}`}
              help="Suma de ingresos de la semana móvil; el promedio divide entre 7 días."
              accent="brand"
            />
            <MetricTile
              icon={<Users className="h-5 w-5" />}
              label="Pedidos y equipo"
              value={stats.todayOrders}
              sub={`${ordersPerStaff} pedidos / persona activa`}
              help={`${stats.activeStaff} miembros del staff activos en el turno.`}
              accent="success"
            />
          </div>
        </div>

        {/* Ocupación y mesas */}
        <div className="xl:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-black/20 p-5">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted">
              Ocupación del local
            </p>
            <RadialGauge value={stats.occupancyRate} label="capacidad usada" />
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {(Object.keys(tableCounts) as TableStatus[]).map((status) => (
                <div key={status} className="rounded-lg bg-white/[0.03] px-2 py-2">
                  <p className="text-lg font-bold" style={{ color: TABLE_STATUS_COLORS[status] }}>
                    {tableCounts[status]}
                  </p>
                  <p className="text-[10px] text-muted">{TABLE_STATUS_LABELS[status]}</p>
                </div>
              ))}
            </div>
          </div>

          {pieData.length > 0 && (
            <div className="rounded-xl border border-border bg-black/20 p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                Distribución de mesas ({totalTables})
              </p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={64}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.status} fill={entry.fill} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const item = payload[0].payload as (typeof pieData)[0];
                        return (
                          <div className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm">
                            <span style={{ color: item.fill }}>{item.name}: </span>
                            <span className="font-semibold text-white">{item.value}</span>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                {pieData.map((item) => (
                  <div key={item.status} className="flex items-center gap-1.5 text-xs text-muted">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.lowStockCount > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3">
              <div className="h-2 w-2 animate-pulse rounded-full bg-warning" />
              <p className="text-sm text-warning">
                <span className="font-semibold">{stats.lowStockCount}</span> productos con stock
                bajo
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
