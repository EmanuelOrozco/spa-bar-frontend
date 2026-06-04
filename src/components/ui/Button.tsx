import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand-500 text-black hover:brightness-110 font-semibold',
  secondary: 'bg-surface-elevated text-foreground border border-border hover:bg-white/5',
  outline: 'border border-border text-foreground hover:bg-white/5',
  ghost: 'text-muted hover:text-foreground hover:bg-white/5',
  danger: 'bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
      {...props}
    >
      {isLoading ? 'Cargando...' : children}
    </button>
  )
);

Button.displayName = 'Button';
