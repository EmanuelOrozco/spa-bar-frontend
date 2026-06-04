'use client';

import { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/RouteGuards';
import { AppShell } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/AuthLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DataTable, DataRow, DataCell } from '@/components/ui/DataTable';
import { LoadingState, EmptyState } from '@/components/ui/Spinner';
import { TableStatusCard } from '@/components/tables/TableStatusCard';
import { TableForm } from '@/components/tables/TableForm';
import { useTables, useReservations, useTableMutations } from '@/hooks/useTables';
import { useAuth } from '@/context/AuthContext';
import {
  reservationSchema,
  ReservationFormValues,
  RESERVATION_STATUS_LABELS,
  TableFormValues,
} from '@/lib/schemas';
import { TABLE_STATUS_LABELS } from '@/lib/constants';
import { formatDate, formatTime } from '@/lib/utils';
import { getApiErrorMessage } from '@/services/http';
import { Table, TableStatus } from '@/types';
import { Plus, Users, Check, LayoutGrid, MapPin } from 'lucide-react';

type StatusFilter = TableStatus | 'ALL';

export default function MesasPage() {
  const { isAdmin } = useAuth();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [reservationModal, setReservationModal] = useState(false);
  const [tableModal, setTableModal] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);
  const [updatingTableId, setUpdatingTableId] = useState<string | null>(null);

  const { data: tablesData, isLoading: tablesLoading } = useTables({ page: 1, limit: 50 });
  const { data: reservationsData, isLoading: reservationsLoading } = useReservations({
    page: 1,
    limit: 10,
  });
  const { createReservation, updateReservation, updateTableStatus, createTable, removeTable } =
    useTableMutations();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      guestCount: 2,
      reservedAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    },
  });

  const tables = tablesData?.data ?? [];

  const existingLocations = useMemo(
    () => Array.from(new Set(tables.map((t) => t.location?.trim()).filter(Boolean) as string[])),
    [tables]
  );

  const filteredTables = useMemo(() => {
    if (statusFilter === 'ALL') return tables;
    return tables.filter((t) => t.status === statusFilter);
  }, [tables, statusFilter]);

  const tablesByLocation = useMemo(() => {
    const groups: Record<string, Table[]> = {};
    for (const table of filteredTables) {
      const location = table.location ?? 'General';
      if (!groups[location]) groups[location] = [];
      groups[location].push(table);
    }
    return groups;
  }, [filteredTables]);

  const counts = useMemo(
    () => ({
      total: tables.length,
      available: tables.filter((t) => t.status === 'AVAILABLE').length,
      occupied: tables.filter((t) => t.status === 'OCCUPIED').length,
      reserved: tables.filter((t) => t.status === 'RESERVED').length,
    }),
    [tables]
  );

  const tableOptions = tables.map((t) => ({
    value: t.id,
    label: `${t.name} (${t.capacity} pax) — ${TABLE_STATUS_LABELS[t.status]}`,
  }));

  const openAddTable = () => setTableModal(true);

  const handleCreateTable = async (values: TableFormValues) => {
    try {
      await createTable.mutateAsync({
        ...values,
        status: 'AVAILABLE',
      });
      toast.success('Mesa creada');
      setTableModal(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const requestDeleteTable = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (table) setTableToDelete(table);
  };

  const confirmDeleteTable = async () => {
    if (!tableToDelete) return;
    try {
      await removeTable.mutateAsync(tableToDelete.id);
      toast.success('Mesa eliminada');
      setTableToDelete(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'No se pudo eliminar. Puede tener reservas o pedidos activos.')
      );
    }
  };

  const openReservation = () => {
    const preferred = tables.find((t) => t.status === 'AVAILABLE') ?? tables[0];
    reset({
      tableId: preferred?.id ?? '',
      customerName: '',
      customerPhone: '',
      guestCount: 2,
      reservedAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      notes: '',
    });
    setReservationModal(true);
  };

  const handleStatusChange = async (tableId: string, status: TableStatus) => {
    setUpdatingTableId(tableId);
    try {
      await updateTableStatus.mutateAsync({ id: tableId, status });
      toast.success(`Mesa marcada como ${TABLE_STATUS_LABELS[status].toLowerCase()}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar la mesa'));
    } finally {
      setUpdatingTableId(null);
    }
  };

  const onSubmitReservation = async (values: ReservationFormValues) => {
    try {
      await createReservation.mutateAsync({
        ...values,
        reservedAt: new Date(values.reservedAt).toISOString(),
      });
      await updateTableStatus.mutateAsync({ id: values.tableId, status: 'RESERVED' });
      toast.success('Reserva creada y mesa marcada como reservada');
      setReservationModal(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const filterTabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'ALL', label: 'Todas', count: counts.total },
    { key: 'AVAILABLE', label: 'Libres', count: counts.available },
    { key: 'OCCUPIED', label: 'Ocupadas', count: counts.occupied },
    { key: 'RESERVED', label: 'Reservadas', count: counts.reserved },
  ];

  return (
    <ProtectedRoute>
      <AppShell>
        <PageHeader
          title="Mesas y Reservas"
          subtitle="Actualiza el estado de las mesas en tiempo real"
          action={
            <div className="flex flex-wrap gap-2">
              {isAdmin && (
                <Button variant="outline" onClick={() => openAddTable()}>
                  <Plus className="h-4 w-4" /> Agregar mesa
                </Button>
              )}
              <Button onClick={openReservation}>
                <Plus className="h-4 w-4" /> Nueva Reserva
              </Button>
            </div>
          }
        />

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <p className="text-xs text-muted">Mesas totales</p>
            <p className="text-2xl font-bold text-white">{counts.total}</p>
          </Card>
          <Card className="border-success/20">
            <p className="text-xs text-muted">Disponibles</p>
            <p className="text-2xl font-bold text-success">{counts.available}</p>
          </Card>
          <Card className="border-warning/20">
            <p className="text-xs text-muted">Ocupadas</p>
            <p className="text-2xl font-bold text-warning">{counts.occupied}</p>
          </Card>
          <Card className="border-info/20">
            <p className="text-xs text-muted">Reservadas</p>
            <p className="text-2xl font-bold text-info">{counts.reserved}</p>
          </Card>
        </div>

        <Card className="mb-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-brand-500" />
              <h3 className="font-semibold text-white">Plano de Mesas</h3>
            </div>
            <p className="text-xs text-muted">
              {isAdmin
                ? 'Usa el botón superior para agregar mesas o actualiza su estado aquí'
                : 'Toca los botones de cada mesa para cambiar su estado'}
            </p>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`rounded-full px-4 py-2 text-sm transition-all ${
                  statusFilter === tab.key
                    ? 'bg-brand-500 font-semibold text-black'
                    : 'border border-border text-muted hover:bg-white/5'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {tablesLoading && <LoadingState />}
          {!tablesLoading && filteredTables.length === 0 && (
            <EmptyState
              title={tables.length === 0 ? 'Sin mesas registradas' : 'No hay mesas con este filtro'}
              description={
                isAdmin && tables.length === 0
                  ? 'Usa el botón Agregar mesa en la parte superior'
                  : undefined
              }
            />
          )}

          {!tablesLoading &&
            Object.entries(tablesByLocation).map(([location, locationTables]) => (
              <div key={location} className="mb-6 last:mb-0">
                <div className="mb-3 flex items-center gap-2 text-sm text-muted">
                  <MapPin className="h-4 w-4 text-brand-500" />
                  <span className="font-medium text-foreground">{location}</span>
                  <span>({locationTables.length})</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {locationTables.map((table) => (
                    <TableStatusCard
                      key={table.id}
                      table={table}
                      isAdmin={isAdmin}
                      isUpdating={updatingTableId === table.id}
                      onStatusChange={handleStatusChange}
                      onDelete={requestDeleteTable}
                    />
                  ))}
                </div>
              </div>
            ))}
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="mb-4 font-semibold text-white">Próximas Reservas</h3>
            {reservationsLoading && <LoadingState />}
            {!reservationsLoading && !reservationsData?.data.length && (
              <EmptyState title="Sin reservas programadas" />
            )}
            <div className="space-y-3">
              {reservationsData?.data.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-black/20 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white">{res.customerName}</p>
                    <p className="text-xs text-muted">
                      {res.tableName} · {res.guestCount} pax · {formatDate(res.reservedAt)}{' '}
                      {formatTime(res.reservedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={res.status === 'CONFIRMED' ? 'success' : 'warning'}>
                      {RESERVATION_STATUS_LABELS[res.status]}
                    </Badge>
                    {isAdmin && res.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        className="px-2 py-1 text-xs"
                        onClick={async () => {
                          await updateReservation.mutateAsync({
                            id: res.id,
                            payload: { status: 'CONFIRMED' },
                          });
                          toast.success('Reserva confirmada');
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-500" />
              <h3 className="font-semibold text-white">Guía rápida para meseros</h3>
            </div>
            <ul className="space-y-3 text-sm text-muted">
              <li className="rounded-lg bg-black/20 px-4 py-3">
                <span className="font-medium text-success">Libre</span> — Usa{' '}
                <strong className="text-white">Ocupar</strong> cuando lleguen clientes sin reserva.
              </li>
              <li className="rounded-lg bg-black/20 px-4 py-3">
                <span className="font-medium text-warning">Ocupada</span> — Usa{' '}
                <strong className="text-white">Liberar mesa</strong> cuando terminen y se vayan.
              </li>
              <li className="rounded-lg bg-black/20 px-4 py-3">
                <span className="font-medium text-info">Reservada</span> — Usa{' '}
                <strong className="text-white">Cliente llegó</strong> al sentarlos, o{' '}
                <strong className="text-white">Liberar</strong> si cancelan.
              </li>
            </ul>
          </Card>

          <Card className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-500" />
              <h3 className="font-semibold text-white">Listado de Reservas</h3>
            </div>
            <DataTable
              columns={[
                { key: 'cliente', label: 'Cliente' },
                { key: 'mesa', label: 'Mesa' },
                { key: 'pax', label: 'Pax' },
                { key: 'fecha', label: 'Fecha' },
                { key: 'estado', label: 'Estado' },
              ]}
            >
              {reservationsData?.data.map((res) => (
                <DataRow key={res.id}>
                  <DataCell className="font-medium">{res.customerName}</DataCell>
                  <DataCell>{res.tableName}</DataCell>
                  <DataCell>{res.guestCount}</DataCell>
                  <DataCell className="text-muted">
                    {formatDate(res.reservedAt)} {formatTime(res.reservedAt)}
                  </DataCell>
                  <DataCell>
                    <Badge variant={res.status === 'CONFIRMED' ? 'success' : 'warning'}>
                      {RESERVATION_STATUS_LABELS[res.status]}
                    </Badge>
                  </DataCell>
                </DataRow>
              ))}
            </DataTable>
          </Card>
        </div>

        <Modal isOpen={tableModal} onClose={() => setTableModal(false)} title="Nueva Mesa">
          <TableForm
            key={tableModal ? 'open' : 'closed'}
            existingLocations={existingLocations}
            onSubmit={handleCreateTable}
            onCancel={() => setTableModal(false)}
            isLoading={createTable.isPending}
          />
        </Modal>

        <ConfirmModal
          isOpen={Boolean(tableToDelete)}
          onClose={() => setTableToDelete(null)}
          onConfirm={confirmDeleteTable}
          title="Eliminar mesa"
          confirmLabel="Eliminar mesa"
          isLoading={removeTable.isPending}
          message={
            tableToDelete ? (
              <>
                ¿Estás seguro de eliminar{' '}
                <strong className="text-white">{tableToDelete.name}</strong>
                {tableToDelete.location ? (
                  <>
                    {' '}
                    de la zona <strong className="text-white">{tableToDelete.location}</strong>
                  </>
                ) : null}
                ? Esta acción no se puede deshacer.
              </>
            ) : null
          }
        />

        <Modal
          isOpen={reservationModal}
          onClose={() => setReservationModal(false)}
          title="Nueva Reserva"
        >
          <form onSubmit={handleSubmit(onSubmitReservation)} className="space-y-4">
            <Controller
              name="tableId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Mesa"
                  options={[{ value: '', label: 'Seleccionar mesa...' }, ...tableOptions]}
                  error={errors.tableId?.message}
                  {...field}
                />
              )}
            />
            <Input
              label="Nombre del cliente"
              error={errors.customerName?.message}
              {...register('customerName')}
            />
            <Input
              label="Teléfono"
              error={errors.customerPhone?.message}
              {...register('customerPhone')}
            />
            <Input
              label="Comensales"
              type="number"
              error={errors.guestCount?.message}
              {...register('guestCount')}
            />
            <Input
              label="Fecha y hora"
              type="datetime-local"
              error={errors.reservedAt?.message}
              {...register('reservedAt')}
            />
            <Input label="Notas" error={errors.notes?.message} {...register('notes')} />
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Guardar Reserva
            </Button>
          </form>
        </Modal>
      </AppShell>
    </ProtectedRoute>
  );
}
