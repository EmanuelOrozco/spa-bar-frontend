import { OrderStatus, PublicUser, ReservationStatus, TableStatus } from '@/types';

export const PRIMARY_ADMIN_EMAIL = 'admin@spabar.com';

export function isPrimaryAdmin(user: Pick<PublicUser, 'email'>): boolean {
  return user.email.trim().toLowerCase() === PRIMARY_ADMIN_EMAIL;
}

export function isDelegatedAdmin(user: Pick<PublicUser, 'email' | 'role'>): boolean {
  return user.role === 'admin' && !isPrimaryAdmin(user);
}

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'PREPARING_BAR', label: 'Prep. Barra' },
  { value: 'PREPARING_KITCHEN', label: 'Prep. Cocina' },
  { value: 'DELIVERED', label: 'Entregado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

export const TABLE_STATUS_OPTIONS: { value: TableStatus; label: string }[] = [
  { value: 'AVAILABLE', label: 'Disponible' },
  { value: 'OCCUPIED', label: 'Ocupada' },
  { value: 'RESERVED', label: 'Reservada' },
];

export const TABLE_STATUS_LABELS: Record<TableStatus, string> = {
  AVAILABLE: 'Disponible',
  OCCUPIED: 'Ocupada',
  RESERVED: 'Reservada',
};

export const DEFAULT_TABLE_ZONES = ['Salón principal', 'Terraza', 'Barra'];

export const RESERVATION_STATUS_OPTIONS: { value: ReservationStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'CONFIRMED', label: 'Confirmada' },
  { value: 'CANCELLED', label: 'Cancelada' },
  { value: 'COMPLETED', label: 'Completada' },
];

export function orderStatusVariant(
  status: OrderStatus
): 'success' | 'warning' | 'danger' | 'default' {
  if (status === 'DELIVERED') return 'success';
  if (status === 'CANCELLED') return 'danger';
  return 'warning';
}

export function tableStatusVariant(status: TableStatus): 'success' | 'warning' | 'default' {
  if (status === 'AVAILABLE') return 'success';
  if (status === 'OCCUPIED') return 'warning';
  return 'default';
}
