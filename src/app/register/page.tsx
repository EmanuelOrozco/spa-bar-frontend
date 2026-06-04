'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { GuestRoute } from '@/components/auth/RouteGuards';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { registerSchema, RegisterFormValues } from '@/lib/schemas';
import { authService } from '@/services/auth.service';
import { getApiErrorMessage, getFieldErrors } from '@/services/http';

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await authService.register(values);
      toast.success('Cuenta creada. Inicia sesión.');
      router.push('/login');
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      Object.entries(fieldErrors).forEach(([field, message]) => {
        setError(field as keyof RegisterFormValues, { message });
      });
      if (!Object.keys(fieldErrors).length) {
        toast.error(getApiErrorMessage(error));
      }
    }
  };

  return (
    <GuestRoute>
      <AuthLayout>
        <div className="glass-panel">
          <h2 className="mb-6 text-xl font-bold text-white">Crear Cuenta</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="name"
              label="Nombre completo"
              placeholder="Tu nombre"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="tu@email.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              id="password"
              label="Contraseña"
              type="password"
              placeholder="Mín. 8 caracteres"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              id="position"
              label="Cargo (opcional)"
              placeholder="Ej: Bartender"
              error={errors.position?.message}
              {...register('position')}
            />
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Registrarse
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-brand-500 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </AuthLayout>
    </GuestRoute>
  );
}
