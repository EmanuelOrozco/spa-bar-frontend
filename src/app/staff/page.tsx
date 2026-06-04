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
import {
  createUserSchema,
  editUserSchema,
  CreateUserFormValues,
  EditUserFormValues,
} from '@/lib/schemas';
import { PublicUser } from '@/types';
import { getApiErrorMessage } from '@/services/http';
import { isPrimaryAdmin, isDelegatedAdmin } from '@/lib/constants';
import { Plus, Pencil, Trash2, UserCheck, Mail, Shield } from 'lucide-react';

export default function StaffPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PublicUser | null>(null);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useUsers({ page: 1, limit: 50, search: search || undefined });
  const { create, update, remove } = useUserMutations();

  const activeCount = data?.data.filter((u) => u.isActive).length ?? 0;
  const isEditingEmployee = editing?.role === 'employee';
  const isEditingDelegatedAdmin = editing ? isDelegatedAdmin(editing) : false;
  const canEditEmail = isEditingEmployee || isEditingDelegatedAdmin;

  const createForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'employee', isActive: true },
  });

  const editForm = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: { role: 'employee', isActive: true },
  });

  const openCreate = () => {
    setEditing(null);
    createForm.reset({
      role: 'employee',
      isActive: true,
      name: '',
      email: '',
      password: '',
      position: '',
    });
    setModalOpen(true);
  };

  const openEdit = (user: PublicUser) => {
    setEditing(user);
    editForm.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      position: user.position ?? '',
      isActive: user.isActive,
      password: '',
    });
    setModalOpen(true);
  };

  const onCreateSubmit = async (values: CreateUserFormValues) => {
    try {
      await create.mutateAsync({ ...values, password: values.password });
      toast.success('Empleado creado');
      setModalOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const onEditSubmit = async (values: EditUserFormValues) => {
    if (!editing) return;

    try {
      const payload: Partial<EditUserFormValues> = {
        name: values.name.trim(),
        position: values.position?.trim() || null,
        isActive: values.isActive,
      };

      if (isEditingEmployee) {
        payload.email = values.email.trim().toLowerCase();
        payload.role = 'employee';
      } else if (isEditingDelegatedAdmin) {
        payload.email = values.email.trim().toLowerCase();
        payload.role = 'admin';
      }

      if (values.password?.trim()) {
        payload.password = values.password;
      }

      await update.mutateAsync({ id: editing.id, payload });

      const emailChanged =
        canEditEmail && values.email.trim().toLowerCase() !== editing.email.toLowerCase();
      toast.success(
        emailChanged ? 'Usuario actualizado (correo modificado)' : 'Usuario actualizado'
      );
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
                      <p className="truncate text-xs text-brand-500/80">{user.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {isPrimaryAdmin(user) ? (
                        <Badge variant="warning">
                          <Shield className="mr-1 inline h-3 w-3" />
                          Gestor principal
                        </Badge>
                      ) : (
                        <Badge variant={user.role === 'admin' ? 'warning' : 'success'}>
                          {user.role === 'admin' ? 'Admin' : 'Empleado'}
                        </Badge>
                      )}
                      <Badge variant={user.isActive ? 'success' : 'danger'}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                      <div className="flex gap-1">
                        {!isPrimaryAdmin(user) && (
                          <Button
                            variant="ghost"
                            className="px-2 py-1"
                            title={
                              user.role === 'employee'
                                ? 'Editar empleado (incluye correo)'
                                : 'Editar administrador designado'
                            }
                            onClick={() => openEdit(user)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {!isPrimaryAdmin(user) && user.role !== 'admin' && (
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
                        {isDelegatedAdmin(user) && (
                          <Button
                            variant="ghost"
                            className="px-2 py-1 text-danger"
                            onClick={async () => {
                              if (confirm(`¿Eliminar al administrador ${user.name}?`)) {
                                await remove.mutateAsync(user.id);
                                toast.success('Administrador eliminado');
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
                El gestor principal (admin@spabar.com) no se edita desde aquí. Empleados y otros
                administradores sí pueden modificarse.
              </p>
            </Card>
          </div>

          {/* Modal crear */}
          <Modal
            isOpen={modalOpen && !editing}
            onClose={() => setModalOpen(false)}
            title="Nuevo Empleado"
          >
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <Input
                label="Nombre"
                error={createForm.formState.errors.name?.message}
                {...createForm.register('name')}
              />
              <Input
                label="Correo electrónico"
                type="email"
                error={createForm.formState.errors.email?.message}
                {...createForm.register('email')}
              />
              <Input
                label="Contraseña"
                type="password"
                placeholder="Mín. 8 caracteres"
                error={createForm.formState.errors.password?.message}
                {...createForm.register('password')}
              />
              <Input
                label="Cargo"
                error={createForm.formState.errors.position?.message}
                {...createForm.register('position')}
              />
              <Controller
                name="role"
                control={createForm.control}
                render={({ field }) => (
                  <Select
                    label="Rol"
                    options={[
                      { value: 'employee', label: 'Empleado' },
                      { value: 'admin', label: 'Administrador' },
                    ]}
                    error={createForm.formState.errors.role?.message}
                    {...field}
                  />
                )}
              />
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  {...createForm.register('isActive')}
                  className="rounded accent-brand-500"
                />
                Empleado activo
              </label>
              <Button
                type="submit"
                className="w-full"
                isLoading={createForm.formState.isSubmitting}
              >
                Crear
              </Button>
            </form>
          </Modal>

          {/* Modal editar */}
          <Modal
            isOpen={modalOpen && Boolean(editing)}
            onClose={() => setModalOpen(false)}
            title={
              isEditingEmployee
                ? 'Editar empleado'
                : isEditingDelegatedAdmin
                  ? 'Editar administrador designado'
                  : 'Editar usuario'
            }
          >
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <Input
                label="Nombre"
                error={editForm.formState.errors.name?.message}
                {...editForm.register('name')}
              />

              {canEditEmail ? (
                <div className="rounded-xl border border-brand-500/30 bg-brand-500/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-brand-500">
                    <Mail className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">
                      Correo de acceso
                    </span>
                  </div>
                  <Input
                    label={
                      isEditingEmployee
                        ? 'Correo electrónico del empleado'
                        : 'Correo del administrador designado'
                    }
                    type="email"
                    autoComplete="off"
                    error={editForm.formState.errors.email?.message}
                    {...editForm.register('email')}
                  />
                  <p className="mt-2 text-xs text-muted">
                    Este usuario iniciará sesión con este correo.
                  </p>
                </div>
              ) : null}

              {canEditEmail && (
                <Input
                  label="Nueva contraseña (opcional)"
                  type="password"
                  placeholder="Dejar vacío para no cambiar"
                  error={editForm.formState.errors.password?.message}
                  {...editForm.register('password')}
                />
              )}

              <Input
                label="Cargo"
                error={editForm.formState.errors.position?.message}
                {...editForm.register('position')}
              />

              <div className="rounded-lg border border-border bg-black/20 px-3 py-2 text-sm text-muted">
                Rol:{' '}
                <span className="font-medium text-white">
                  {isEditingEmployee
                    ? 'Empleado'
                    : isEditingDelegatedAdmin
                      ? 'Administrador designado'
                      : '—'}
                </span>
              </div>

              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  {...editForm.register('isActive')}
                  className="rounded accent-brand-500"
                />
                Usuario activo
              </label>

              <Button type="submit" className="w-full" isLoading={editForm.formState.isSubmitting}>
                {isEditingEmployee
                  ? 'Guardar empleado'
                  : isEditingDelegatedAdmin
                    ? 'Guardar administrador'
                    : 'Guardar'}
              </Button>
            </form>
          </Modal>
        </AppShell>
      </RoleGuard>
    </ProtectedRoute>
  );
}
