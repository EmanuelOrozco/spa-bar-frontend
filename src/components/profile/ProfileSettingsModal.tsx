'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { isPrimaryAdmin } from '@/lib/constants';
import { profileSettingsSchema, ProfileSettingsFormValues } from '@/lib/schemas';
import { authService } from '@/services/auth.service';
import { getApiErrorMessage } from '@/services/http';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { user, updateSession } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (values: ProfileSettingsFormValues) => {
    if (!user) return;

    try {
      const result = await authService.updateProfile({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      updateSession(result.accessToken, result.refreshToken, result.user);
      toast.success('Contraseña actualizada');
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const isMainAdmin = user ? isPrimaryAdmin(user) : false;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configuración de cuenta">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-muted">
          Sesión de{' '}
          <span className="font-medium text-white">
            {user?.name}
            {isMainAdmin ? ' · Gestor principal' : ''}
          </span>
        </p>

        <div className="rounded-xl border border-border bg-black/20 px-4 py-3">
          <p className="text-xs text-muted">Correo electrónico</p>
          <p className="text-sm font-medium text-white">{user?.email}</p>
          {!isMainAdmin && user?.role === 'employee' && (
            <p className="mt-1 text-xs text-muted">
              Solo un administrador puede cambiar el correo. Contacta a tu supervisor si necesitas
              actualizarlo.
            </p>
          )}
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
            Cambiar contraseña
          </p>
          <div className="space-y-3">
            <Input
              label="Nueva contraseña"
              type="password"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <Input
              label="Confirmar nueva contraseña"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <Input
              label="Contraseña actual"
              type="password"
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Guardar contraseña
          </Button>
        </div>
      </form>
    </Modal>
  );
}
