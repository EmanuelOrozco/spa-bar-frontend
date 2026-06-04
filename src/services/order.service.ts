import { http } from './http';
import {
  ApiResponse,
  Order,
  OrderStatus,
  OrderStats,
  DashboardStats,
  PaginationMeta,
} from '@/types';

export interface OrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  tableId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface OrderItemPayload {
  productId: string;
  quantity: number;
}

export interface OrderPayload {
  tableId?: string | null;
  status?: OrderStatus;
  notes?: string | null;
  items: OrderItemPayload[];
}

export const orderService = {
  async list(filters: OrderFilters = {}): Promise<{ data: Order[]; meta: PaginationMeta }> {
    const { data } = await http.get<ApiResponse<Order[]>>('/orders', { params: filters });
    return { data: data.data ?? [], meta: data.meta! };
  },

  async getById(id: string): Promise<Order> {
    const { data } = await http.get<ApiResponse<Order>>(`/orders/${id}`);
    return data.data!;
  },

  async create(payload: OrderPayload): Promise<Order> {
    const { data } = await http.post<ApiResponse<Order>>('/orders', payload);
    return data.data!;
  },

  async update(id: string, payload: Partial<OrderPayload>): Promise<Order> {
    const { data } = await http.put<ApiResponse<Order>>(`/orders/${id}`, payload);
    return data.data!;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/orders/${id}`);
  },

  async getStats(): Promise<OrderStats> {
    const { data } = await http.get<ApiResponse<OrderStats>>('/orders/stats');
    return data.data!;
  },

  async getDashboard(): Promise<DashboardStats> {
    const { data } = await http.get<ApiResponse<DashboardStats>>('/orders/dashboard');
    return data.data!;
  },
};
