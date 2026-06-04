import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'default';
  className?: string;
}

const variants = {
  success: 'bg-success/15 text-emerald-400 border-success/20',
  warning: 'bg-brand-500/15 text-brand-400 border-brand-500/20',
  danger: 'bg-danger/15 text-red-400 border-danger/20',
  default: 'bg-white/5 text-muted border-border',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
