'use client';

import Link from 'next/link';
import Image from 'next/image';
import { APP_SHORT_NAME, LOGO_HEIGHT, LOGO_WIDTH } from '@/lib/branding';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Wine,
  Package,
  TrendingUp,
  Users,
  CalendarDays,
  LogOut,
  Menu,
  X,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { ProfileSettingsModal } from '@/components/profile/ProfileSettingsModal';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    employeeLabel: 'Mi turno',
    adminLabel: 'Panel Admin',
  },
  { href: '/menu', label: 'Menú', icon: Wine },
  { href: '/inventario', label: 'Inventario', icon: Package },
  { href: '/ventas', label: 'Ventas', icon: TrendingUp },
  { href: '/mesas', label: 'Mesas', icon: CalendarDays },
  { href: '/staff', label: 'Staff', icon: Users, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
          className="size-11 shrink-0 object-contain"
        />
        <div>
          <h3 className="font-bold text-white">{APP_SHORT_NAME}</h3>
          <span className="text-xs text-muted">Bares y restaurantes</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const navLabel =
            'adminLabel' in item && 'employeeLabel' in item
              ? isAdmin
                ? item.adminLabel
                : item.employeeLabel
              : item.label;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'border border-brand-500/20 bg-brand-500/10 text-brand-500'
                  : 'text-muted hover:bg-white/5 hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {navLabel}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border pt-4">
        <button
          type="button"
          onClick={() => {
            setSettingsOpen(true);
            setMobileOpen(false);
          }}
          className="mb-3 flex w-full items-center gap-3 rounded-xl border border-border bg-black/20 px-3 py-2 text-left transition-colors hover:border-brand-500/30 hover:bg-white/5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-500">
            {user?.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
          <Settings className="h-4 w-4 shrink-0 text-muted" />
          <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
        </button>
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
      <ProfileSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

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
