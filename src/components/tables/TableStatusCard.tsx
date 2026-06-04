'use client';

import { Table, TableStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TABLE_STATUS_LABELS, tableStatusVariant } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Armchair, CalendarCheck, Check, DoorOpen, Trash2, Users } from 'lucide-react';

const STATUS_STYLES: Record<TableStatus, string> = {
  AVAILABLE: 'border-success/30 bg-success/5',
  OCCUPIED: 'border-warning/40 bg-warning/5',
  RESERVED: 'border-info/30 bg-info/5',
};

const STATUS_DOT: Record<TableStatus, string> = {
  AVAILABLE: 'bg-success',
  OCCUPIED: 'bg-warning',
  RESERVED: 'bg-info',
};

interface TableStatusCardProps {
  table: Table;
  isUpdating?: boolean;
  isAdmin?: boolean;
  onStatusChange: (tableId: string, status: TableStatus) => void;
  onDelete?: (tableId: string) => void;
}

export function TableStatusCard({
  table,
  isUpdating,
  isAdmin,
  onStatusChange,
  onDelete,
}: TableStatusCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border p-4 transition-all',
        STATUS_STYLES[table.status],
        isUpdating && 'opacity-60'
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_DOT[table.status])} />
            <h4 className="font-semibold text-white">{table.name}</h4>
          </div>
          <p className="mt-1 text-xs text-muted">
            Mesa {table.number} · {table.location ?? 'Sin ubicación'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Badge variant={tableStatusVariant(table.status)}>
            {TABLE_STATUS_LABELS[table.status]}
          </Badge>
          {isAdmin && onDelete && (
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 text-muted hover:text-danger"
              disabled={isUpdating}
              onClick={() => onDelete(table.id)}
              title="Eliminar mesa"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 text-xs text-muted">
        <Users className="h-3.5 w-3.5" />
        <span>Hasta {table.capacity} personas</span>
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        {table.status === 'AVAILABLE' && (
          <>
            <Button
              className="flex-1 text-xs"
              isLoading={isUpdating}
              onClick={() => onStatusChange(table.id, 'OCCUPIED')}
            >
              <Armchair className="h-3.5 w-3.5" />
              Ocupar
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-xs"
              isLoading={isUpdating}
              onClick={() => onStatusChange(table.id, 'RESERVED')}
            >
              <CalendarCheck className="h-3.5 w-3.5" />
              Reservar
            </Button>
          </>
        )}

        {table.status === 'OCCUPIED' && (
          <Button
            variant="outline"
            className="w-full text-xs"
            isLoading={isUpdating}
            onClick={() => onStatusChange(table.id, 'AVAILABLE')}
          >
            <DoorOpen className="h-3.5 w-3.5" />
            Liberar mesa
          </Button>
        )}

        {table.status === 'RESERVED' && (
          <>
            <Button
              className="flex-1 text-xs"
              isLoading={isUpdating}
              onClick={() => onStatusChange(table.id, 'OCCUPIED')}
            >
              <Check className="h-3.5 w-3.5" />
              Cliente llegó
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-xs"
              isLoading={isUpdating}
              onClick={() => onStatusChange(table.id, 'AVAILABLE')}
            >
              <DoorOpen className="h-3.5 w-3.5" />
              Liberar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
