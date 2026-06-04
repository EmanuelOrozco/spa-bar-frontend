import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface DataTableProps {
  columns: { key: string; label: string; className?: string }[];
  children: ReactNode;
  emptyMessage?: string;
}

export function DataTable({ columns, children, emptyMessage }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
            {columns.map((col) => (
              <th key={col.key} className={cn('pb-3 pr-4 font-medium', col.className)}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {!children && emptyMessage && (
        <p className="py-8 text-center text-sm text-muted">{emptyMessage}</p>
      )}
    </div>
  );
}

export function DataRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr
      className={cn('border-b border-border/50 transition-colors hover:bg-white/[0.03]', className)}
    >
      {children}
    </tr>
  );
}

export function DataCell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn('py-3.5 pr-4', className)}>{children}</td>;
}
