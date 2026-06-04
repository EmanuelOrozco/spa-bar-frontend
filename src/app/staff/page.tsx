'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ProtectedRoute, RoleGuard } from '@/components/auth/RouteGuards';
import { AppShell } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/layout/AuthLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LoadingState, EmptyState } from '@/components/ui/Spinner';
import { useUsers, useUserMutations } from '@/hooks/useUsers';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, UserFormValues } from '@/lib/schemas';
import { PublicUser } from '@/types';
import { getApiErrorMessage } from '@/services/http';
import { Plus, Pencil, Trash2, UserCheck } from 'lucide-react';

export default function StaffPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PublicUser | null>(null);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useUsers({ page: 1, limit: 50, search: search || undefined });
  const { create, update, remove } = useUserMutations();

  const activeCount = data?.data.filter((u) => u.isActive).length ?? 0;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { role: 'employee', isActive: true },
  });

  const openCreate = () => {
    setEditing(null);
    reset({ role: 'employee', isActive: true, name: '', email: '', password: '', position: '' });
    setModalOpen(true);
  };

  const openEdit = (user: PublicUser) => {
    setEditing(user);
    reset({
      name: user.name,
      email: user.email,
      role: user.role,
      position: user.position ?? '',
      isActive: user.isActive,
    });
    setModalOpen(true);
  };

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, payload: values });
        toast.success('Empleado actualizado');
      } else {
        if (!values.password) {
          toast.error('La contraseña es requerida');
          return;
        }
        await create.mutateAsync({ ...values, password: values.password });
        toast.success('Empleado creado');
      }
      setModalOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <ProtectedRoute>
      <RoleGuard role="admin">
        <AppShell>
          <PageHeader
            title="Gestión de Personal"
            subtitle={`${activeCount} miembros activos del equipo`}
            action={
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Nuevo Empleado
              </Button>
            }
          />

          <div className="mb-6">
            <Input
              placeholder="Buscar por nombre, email o cargo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </div>

          {isLoading && <LoadingState />}
          {!isLoading && !data?.data.length && (
            <EmptyState
              title="Sin empleados"
              action={<Button onClick={openCreate}>Agregar empleado</Button>}
            />
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-white">Equipo ({data?.meta.total ?? 0})</h3>
                <Badge variant="success">
                  <UserCheck className="mr-1 inline h-3 w-3" />
                  Operativo
                </Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {data?.data.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-black/20 p-4 transition-all hover:border-brand-500/20 hover:bg-white/[0.03]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-brand-500/30 bg-brand-500/10 text-lg font-bold text-brand-500">
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">{user.name}</p>
                      <p className="truncate text-xs text-muted">{user.position ?? user.role}</p>
                      <p className="truncate text-xs text-muted/70">{user.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={user.isActive ? 'success' : 'danger'}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          className="px-2 py-1"
                          onClick={() => openEdit(user)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {user.role !== 'admin' && (
                          <Button
                            variant="ghost"
                            className="px-2 py-1 text-danger"
                            onClick={async () => {
                              if (confirm(`¿Eliminar a ${user.name}?`)) {
                                await remove.mutateAsync(user.id);
                                toast.success('Empleado eliminado');
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="mb-4 font-semibold text-white">Resumen</h3>
              <div className="space-y-4">
                <div className="rounded-xl bg-black/20 p-4">
                  <p className="text-xs text-muted">Total personal</p>
                  <p className="text-3xl font-bold text-white">{data?.meta.total ?? 0}</p>
                </div>
                <div className="rounded-xl bg-black/20 p-4">
                  <p className="text-xs text-muted">Administradores</p>
                  <p className="text-2xl font-bold text-brand-500">
                    {data?.data.filter((u) => u.role === 'admin').length ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-black/20 p-4">
                  <p className="text-xs text-muted">Empleados activos</p>
                  <p className="text-2xl font-bold text-success">{activeCount}</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted">
                Contraseña por defecto nuevos empleados: Employee123!
              </p>
            </Card>
          </div>

          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editing ? 'Editar Empleado' : 'Nuevo Empleado'}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Nombre" error={errors.name?.message} {...register('name')} />
              <Input
                label="Email"
                type="email"
                error={errors.email?.message}
                {...register('email')}
              />
              {!editing && (
                <Input
                  label="Contraseña"
                  type="password"
                  placeholder="Mín. 8 caracteres"
                  error={errors.password?.message}
                  {...register('password')}
                />
              )}
              <Input label="Cargo" error={errors.position?.message} {...register('position')} />
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Rol"
                    options={[
                      { value: 'employee', label: 'Empleado' },
                      { value: 'admin', label: 'Administrador' },
                    ]}
                    error={errors.role?.message}
                    {...field}
                  />
                )}
              />
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  className="rounded accent-brand-500"
                />
                Empleado activo
              </label>
              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Guardar
              </Button>
            </form>
          </Modal>
        </AppShell>
      </RoleGuard>
    </ProtectedRoute>
  );
}
