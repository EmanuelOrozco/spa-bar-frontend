'use client';

import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Order } from '@/types';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { ORDER_STATUS_LABELS } from '@/lib/schemas';
import { orderStatusVariant } from '@/lib/constants';
import { MapPin, User, FileText, Receipt } from 'lucide-react';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

function InfoBlock({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-black/20 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-medium text-white">{value}</p>
      </div>
    </div>
  );
}

export function OrderDetailModal({ order, isOpen, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Pedido #${order.orderNumber}`}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={orderStatusVariant(order.status)}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
            <span className="text-xs text-muted">
              {formatDate(order.createdAt)} · {formatTime(order.createdAt)}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Total</p>
            <p className="text-xl font-bold text-brand-500">{formatCurrency(order.total)}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoBlock
            icon={<MapPin className="h-4 w-4" />}
            label="Mesa"
            value={order.tableName ?? 'Barra / sin mesa'}
          />
          <InfoBlock
            icon={<User className="h-4 w-4" />}
            label="Atendido por"
            value={order.userName}
          />
        </div>

        <div className="rounded-xl border border-border bg-black/20 px-4 py-3">
          <div className="mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted" />
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Notas del pedido
            </p>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">
            {order.notes?.trim() ? order.notes : 'Sin notas adicionales.'}
          </p>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted" />
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Productos ({order.items.length})
            </p>
          </div>
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li key={item.id} className="rounded-xl border border-border bg-black/20 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{item.productName}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      Cantidad: {item.quantity} · Unitario: {formatCurrency(item.unitPrice)}
                    </p>
                    {item.productDescription?.trim() && (
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {item.productDescription}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 font-semibold text-brand-500">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {order.status === 'DELIVERED' && (
          <p className="rounded-lg border border-success/20 bg-success/5 px-3 py-2 text-xs text-success">
            El inventario se descontó al marcar este pedido como entregado.
          </p>
        )}
      </div>
    </Modal>
  );
}
