'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProtectedRoute } from '@/components/auth/RouteGuards';
import { AppShell } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/AuthLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingState } from '@/components/ui/Spinner';
import { DataTable, DataRow, DataCell } from '@/components/ui/DataTable';
import { useOrders, useOrderStats, useOrderMutations } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useTables } from '@/hooks/useTables';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatTime } from '@/lib/utils';
import { orderSchema, OrderFormValues } from '@/lib/schemas';
import { ORDER_STATUS_OPTIONS } from '@/lib/constants';
import { getApiErrorMessage } from '@/services/http';
import { OrderStatus } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Plus, Trash2, DollarSign, Ticket, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

function buildWeekChart(orders: { total: number; createdAt: string }[]) {
  const map = new Map<number, number>();
  for (let i = 0; i < 7; i++) map.set(i, 0);
  orders.forEach((o) => {
    const day = new Date(o.createdAt).getDay();
    map.set(day, (map.get(day) ?? 0) + o.total);
  });
  return Array.from(map.entries()).map(([day, total]) => ({
    name: DAYS[day],
    total: Math.round(total),
  }));
}

export default function VentasPage() {
  const { isAdmin } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const { data: stats, isLoading: statsLoading } = useOrderStats();
  const { data: ordersData, isLoading } = useOrders({ page: 1, limit: 20 });
  const { data: productsData } = useProducts({ page: 1, limit: 100, isMenuItem: true });
  const { data: tablesData } = useTables({ page: 1, limit: 20 });
  const { create, update, remove } = useOrderMutations();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: { items: [{ productId: '', quantity: 1 }] },
  });

  const { fields, append, remove: removeItem } = useFieldArray({ control, name: 'items' });

  const productOptions =
    productsData?.data.map((p) => ({
      value: p.id,
      label: `${p.name} — ${formatCurrency(p.price)}`,
    })) ?? [];

  const tableOptions = [
    { value: '', label: 'Sin mesa / Barra' },
    ...(tablesData?.data.map((t) => ({ value: t.id, label: t.name })) ?? []),
  ];

  const onSubmit = async (values: OrderFormValues) => {
    try {
      await create.mutateAsync({
        ...values,
        tableId: values.tableId && values.tableId.length > 0 ? values.tableId : null,
      });
      toast.success('Pedido creado');
      setModalOpen(false);
      reset({ items: [{ productId: '', quantity: 1 }] });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await update.mutateAsync({ id: orderId, payload: { status } });
      toast.success('Estado actualizado');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const chartData = buildWeekChart(ordersData?.data ?? []);

  return (
    <ProtectedRoute>
      <AppShell>
        <PageHeader
          title="Reporte de Ventas"
          subtitle="Desempeño financiero y pedidos"
          action={
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" /> Nuevo Pedido
            </Button>
          }
        />

        {statsLoading && <LoadingState />}
        {stats && (
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Ingresos Semana"
              value={formatCurrency(stats.weekSales)}
              icon={<DollarSign className="h-6 w-6" />}
            />
            <StatCard
              label="Ticket Promedio"
              value={formatCurrency(stats.avgTicket)}
              icon={<Ticket className="h-6 w-6" />}
            />
            <StatCard
              label="Pedidos Hoy"
              value={stats.todayOrders}
              icon={<Package className="h-6 w-6" />}
            />
          </div>
        )}

        <div className="grid gap-6">
          <Card>
            <h3 className="mb-4 font-semibold text-white">Ventas por Día</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-xl border border-border bg-[#181a20] px-3 py-2 shadow-xl">
                        <p className="mb-1 text-xs text-muted">{label}</p>
                        <p className="text-sm font-semibold text-brand-500">
                          {formatCurrency(payload[0].value as number)}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="total" fill="#ff9f43" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="mb-4 font-semibold text-white">Pedidos</h3>
            {isLoading && <LoadingState />}
            <DataTable
              columns={[
                { key: 'num', label: '#' },
                { key: 'mesa', label: 'Mesa' },
                { key: 'total', label: 'Total' },
                { key: 'estado', label: 'Estado' },
                { key: 'hora', label: 'Hora' },
                { key: 'accion', label: 'Acción' },
              ]}
            >
              {ordersData?.data.map((order) => (
                <DataRow key={order.id}>
                  <DataCell className="text-muted">#{order.orderNumber}</DataCell>
                  <DataCell>{order.tableName ?? 'Barra'}</DataCell>
                  <DataCell className="font-medium">{formatCurrency(order.total)}</DataCell>
                  <DataCell>
                    <Select
                      size="sm"
                      options={ORDER_STATUS_OPTIONS.map((opt) => ({
                        value: opt.value,
                        label: opt.label,
                      }))}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="min-w-[140px]"
                    />
                  </DataCell>
                  <DataCell className="text-muted">{formatTime(order.createdAt)}</DataCell>
                  <DataCell>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        className="px-2 py-1"
                        onClick={async () => {
                          if (confirm('¿Eliminar pedido?')) {
                            await remove.mutateAsync(order.id);
                            toast.success('Pedido eliminado');
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </DataCell>
                </DataRow>
              ))}
            </DataTable>
          </Card>
        </div>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Pedido">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="tableId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Mesa (opcional)"
                  options={tableOptions}
                  {...field}
                  value={field.value ?? ''}
                />
              )}
            />
            <Input label="Notas" error={errors.notes?.message} {...register('notes')} />
            <div className="space-y-3">
              <p className="text-sm font-medium text-white">Productos</p>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Controller
                    name={`items.${index}.productId`}
                    control={control}
                    render={({ field: f }) => (
                      <Select
                        options={[{ value: '', label: 'Seleccionar...' }, ...productOptions]}
                        className="flex-1"
                        {...f}
                      />
                    )}
                  />
                  <Input type="number" className="w-20" {...register(`items.${index}.quantity`)} />
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" onClick={() => removeItem(index)}>
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              {errors.items?.root?.message && (
                <p className="text-xs text-danger">{errors.items.root.message}</p>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ productId: '', quantity: 1 })}
              >
                + Agregar producto
              </Button>
            </div>
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Crear Pedido
            </Button>
          </form>
        </Modal>
      </AppShell>
    </ProtectedRoute>
  );
}
