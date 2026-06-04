'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { GuestRoute } from '@/components/auth/RouteGuards';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { loginSchema, LoginFormValues } from '@/lib/schemas';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage, getFieldErrors } from '@/services/http';
import { APP_NAME, BRAND_NAME, LOGO_HEIGHT, LOGO_WIDTH } from '@/lib/branding';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (searchParams.get('session') === 'expired') {
      toast.error('Tu sesión expiró. Inicia sesión nuevamente.');
    }
  }, [searchParams]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const result = await authService.login(values);
      login(result.accessToken, result.refreshToken, result.user);
      toast.success('Bienvenido');
      router.push('/dashboard');
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      Object.entries(fieldErrors).forEach(([field, message]) => {
        setError(field as keyof LoginFormValues, { message });
      });
      if (!Object.keys(fieldErrors).length) {
        setError('email', { message: getApiErrorMessage(error, 'Credenciales inválidas') });
      }
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8 flex w-full flex-col items-center justify-center text-center lg:hidden">
        <div className="relative mb-4 flex justify-center">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/15 blur-2xl"
            aria-hidden
          />
          <Image
            src="/logo-spa-bar.png"
            alt=""
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
            className="relative size-24 object-contain"
            priority
            aria-hidden
          />
        </div>
        <p className="text-xl font-bold text-brand-500">{BRAND_NAME}</p>
        <h1 className="mt-1 text-base font-bold text-white">{APP_NAME}</h1>
      </div>

      <div className="glass-panel">
        <h2 className="mb-6 text-xl font-bold text-white">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Entrar
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-brand-500 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <GuestRoute>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </GuestRoute>
  );
}
