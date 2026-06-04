'use client';

import Image from 'next/image';
import { ReactNode } from 'react';
import { APP_NAME, APP_TAGLINE, BRAND_NAME, LOGO_HEIGHT, LOGO_WIDTH } from '@/lib/branding';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden min-h-screen w-1/2 overflow-hidden bg-surface lg:grid lg:place-items-center lg:px-12 lg:py-16">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(255, 159, 67, 0.12) 0%, transparent 65%), radial-gradient(circle at 20% 80%, rgba(14, 165, 233, 0.06) 0%, transparent 45%)',
          }}
        />

        <div className="relative z-10 flex w-full max-w-md flex-col items-center justify-center px-6 text-center">
          <div className="relative mb-8 flex justify-center">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 size-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/15 blur-3xl"
              aria-hidden
            />
            <Image
              src="/logo-spa-bar.png"
              alt=""
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
              className="relative size-36 shrink-0 object-contain drop-shadow-[0_12px_40px_rgba(255,159,67,0.25)] xl:size-40"
              priority
              aria-hidden
            />
          </div>

          <p className="mb-2 text-3xl font-bold tracking-tight text-brand-500 xl:text-4xl">
            {BRAND_NAME}
          </p>
          <h1 className="mb-3 text-xl font-bold leading-snug text-white xl:text-2xl">{APP_NAME}</h1>
          <p className="mx-auto max-w-sm text-center text-sm leading-relaxed text-muted xl:text-base">
            {APP_TAGLINE}
          </p>
        </div>
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
