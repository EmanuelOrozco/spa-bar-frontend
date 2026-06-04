export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  details?: Record<string, string[]>;
}

export type Role = 'admin' | 'employee';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  position: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

export type ProductCategory =
  | 'COCKTAILS'
  | 'BEERS'
  | 'APPETIZERS'
  | 'MAINS'
  | 'LIQUOR'
  | 'FRUITS'
  | 'SOFT_DRINKS'
  | 'SUPPLIES';

export type ProductStatus = 'ACTIVE' | 'LOW_STOCK' | 'INACTIVE';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  price: number;
  stock: number;
  minStock: number;
  unit: string;
  status: ProductStatus;
  imageData: string | null;
  hasImage?: boolean;
  isMenuItem: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'PREPARING_BAR'
  | 'PREPARING_KITCHEN'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productDescription: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  tableId: string | null;
  tableName: string | null;
  userId: string;
  userName: string;
  status: OrderStatus;
  total: number;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';

export interface Table {
  id: string;
  number: string;
  name: string;
  capacity: number;
  status: TableStatus;
  location: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Reservation {
  id: string;
  tableId: string;
  tableName: string;
  userId: string;
  userName: string;
  customerName: string;
  customerPhone: string | null;
  guestCount: number;
  reservedAt: string;
  status: ReservationStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  weekSales: number;
  avgTicket: number;
  lowStockCount: number;
  activeStaff: number;
  occupancyRate: number;
}

export interface OrderStats {
  todaySales: number;
  todayOrders: number;
  weekSales: number;
  avgTicket: number;
}
