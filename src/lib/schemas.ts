import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(100),
  email: z.string().trim().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Incluye una mayúscula')
    .regex(/[a-z]/, 'Incluye una minúscula')
    .regex(/[0-9]/, 'Incluye un número'),
  position: z.string().trim().max(100).optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const productSchema = z.object({
  sku: z.string().trim().min(2, 'Código requerido'),
  name: z.string().trim().min(2, 'Nombre requerido'),
  description: z.string().trim().max(500).optional(),
  category: z.enum([
    'COCKTAILS',
    'BEERS',
    'APPETIZERS',
    'MAINS',
    'LIQUOR',
    'FRUITS',
    'SOFT_DRINKS',
    'SUPPLIES',
  ]),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  minStock: z.coerce.number().int().min(0),
  unit: z.string().trim().min(1),
  imageData: z
    .union([z.string(), z.null()])
    .optional()
    .refine(
      (value) =>
        value === undefined ||
        value === null ||
        /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value),
      'Formato de imagen inválido'
    )
    .refine(
      (value) => value === undefined || value === null || value.length <= 2_800_000,
      'La imagen es demasiado grande'
    ),
  isMenuItem: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const userSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8).optional(),
  role: z.enum(['admin', 'employee']),
  position: z.string().trim().max(100).optional().nullable(),
  isActive: z.boolean().optional(),
});

export type UserFormValues = z.infer<typeof userSchema>;

export const orderSchema = z.object({
  tableId: z.string().optional(),
  notes: z.string().trim().max(500).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Selecciona un producto'),
        quantity: z.coerce.number().int().min(1),
      })
    )
    .min(1, 'Agrega al menos un producto'),
});

export type OrderFormValues = z.infer<typeof orderSchema>;

export const reservationSchema = z.object({
  tableId: z.string().uuid('Selecciona una mesa'),
  customerName: z.string().trim().min(2, 'Nombre requerido'),
  customerPhone: z.string().trim().max(20).optional(),
  guestCount: z.coerce.number().int().min(1).max(50),
  reservedAt: z.string().min(1, 'Fecha y hora requeridas'),
  notes: z.string().trim().max(500).optional(),
});

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
};

export type ReservationFormValues = z.infer<typeof reservationSchema>;

export const tableSchema = z.object({
  number: z.string().trim().min(1, 'Número requerido').max(20),
  name: z.string().trim().min(2, 'Nombre requerido').max(100),
  capacity: z.coerce.number().int().min(1, 'Mínimo 1 persona').max(50),
  location: z.string().trim().min(2, 'Zona requerida').max(100),
});

export type TableFormValues = z.infer<typeof tableSchema>;

export const CATEGORY_LABELS: Record<string, string> = {
  COCKTAILS: 'Cócteles de Autor',
  BEERS: 'Cervezas',
  APPETIZERS: 'Entradas',
  MAINS: 'Platos Fuertes',
  LIQUOR: 'Licores',
  FRUITS: 'Frutas/Verduras',
  SOFT_DRINKS: 'Refrescos',
  SUPPLIES: 'Insumos',
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PREPARING_BAR: 'Prep. Barra',
  PREPARING_KITCHEN: 'Prep. Cocina',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};
