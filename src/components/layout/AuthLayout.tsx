'use client';

import Image from 'next/image';
import { ReactNode } from 'react';
import { APP_NAME, APP_TAGLINE } from '@/lib/branding';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col items-center justify-center bg-surface-elevated p-12 lg:flex">
        <Image
          src="/logo-spa-bar.png"
          alt={APP_NAME}
          width={200}
          height={200}
          className="mb-8 rounded-2xl shadow-2xl shadow-brand-500/20"
          priority
        />
        <h1 className="mb-2 text-center text-3xl font-bold text-white">{APP_NAME}</h1>
        <p className="max-w-sm text-center text-muted">{APP_TAGLINE}</p>
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
