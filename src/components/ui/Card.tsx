import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <div className={cn('glass-panel', className)}>{children}</div>;
}

export function StatCard({
  icon,
  label,
  value,
  trend,
  badge,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  badge?: ReactNode;
}) {
  return (
    <Card className="flex h-36 flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-xl text-brand-500">
          {icon}
        </div>
        {trend && <span className="text-xs text-success">{trend}</span>}
        {badge}
      </div>
      <div>
        <div className="text-3xl font-bold text-white">{value}</div>
        <span className="text-xs text-muted">{label}</span>
      </div>
    </Card>
  );
}
