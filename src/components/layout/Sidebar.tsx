'use client';

import Link from 'next/link';
import Image from 'next/image';
import { APP_SHORT_NAME } from '@/lib/branding';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Wine,
  Package,
  TrendingUp,
  Users,
  Shield,
  CalendarDays,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/menu', label: 'Menú', icon: Wine },
  { href: '/inventario', label: 'Inventario', icon: Package },
  { href: '/ventas', label: 'Ventas', icon: TrendingUp },
  { href: '/mesas', label: 'Mesas', icon: CalendarDays },
  { href: '/staff', label: 'Staff', icon: Users, adminOnly: true },
  { href: '/admin', label: 'Admin', icon: Shield, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const filteredNav = navItems.filter((item) => !item.adminOnly || isAdmin);

  const NavContent = () => (
    <>
      <div className="mb-8 flex items-center gap-3">
        <Image
          src="/logo-spa-bar.png"
          alt={APP_SHORT_NAME}
          width={44}
          height={44}
          className="rounded-xl"
        />
        <div>
          <h3 className="font-bold text-white">{APP_SHORT_NAME}</h3>
          <span className="text-xs text-muted">Bares y restaurantes</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {filteredNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
              pathname === href || pathname.startsWith(href + '/')
                ? 'border border-brand-500/20 bg-brand-500/10 text-brand-500'
                : 'text-muted hover:bg-white/5 hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto border-t border-border pt-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-border bg-black/20 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-500">
            {user?.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="truncate text-xs text-muted">{user?.position ?? user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-danger transition-colors hover:bg-danger/10"
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-black shadow-lg lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Menú"
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <aside className="hidden h-screen w-64 flex-shrink-0 flex-col border-r border-border bg-surface/95 p-6 lg:sticky lg:top-0 lg:flex">
        <NavContent />
      </aside>

      {mobileOpen && (
        <aside className="fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-surface p-6 lg:hidden">
          <NavContent />
        </aside>
      )}
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="page-enter">{children}</div>
      </main>
    </div>
  );
}
