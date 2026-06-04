import { http } from './http';
import {
  ApiResponse,
  Table,
  TableStatus,
  Reservation,
  ReservationStatus,
  PaginationMeta,
} from '@/types';

export interface TableFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: TableStatus;
}

export interface TablePayload {
  number: string;
  name: string;
  capacity?: number;
  status?: TableStatus;
  location?: string | null;
}

export interface ReservationFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: ReservationStatus;
  tableId?: string;
}

export interface ReservationPayload {
  tableId: string;
  customerName: string;
  customerPhone?: string | null;
  guestCount: number;
  reservedAt: string;
  status?: ReservationStatus;
  notes?: string | null;
}

export const tableService = {
  async list(filters: TableFilters = {}): Promise<{ data: Table[]; meta: PaginationMeta }> {
    const { data } = await http.get<ApiResponse<Table[]>>('/tables', { params: filters });
    return { data: data.data ?? [], meta: data.meta! };
  },

  async create(payload: TablePayload): Promise<Table> {
    const { data } = await http.post<ApiResponse<Table>>('/tables', payload);
    return data.data!;
  },

  async update(id: string, payload: Partial<TablePayload>): Promise<Table> {
    const { data } = await http.put<ApiResponse<Table>>(`/tables/${id}`, payload);
    return data.data!;
  },

  async updateStatus(id: string, status: TableStatus): Promise<Table> {
    const { data } = await http.patch<ApiResponse<Table>>(`/tables/${id}/status`, { status });
    return data.data!;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/tables/${id}`);
  },
};

export const reservationService = {
  async list(
    filters: ReservationFilters = {}
  ): Promise<{ data: Reservation[]; meta: PaginationMeta }> {
    const { data } = await http.get<ApiResponse<Reservation[]>>('/reservations', {
      params: filters,
    });
    return { data: data.data ?? [], meta: data.meta! };
  },

  async create(payload: ReservationPayload): Promise<Reservation> {
    const { data } = await http.post<ApiResponse<Reservation>>('/reservations', payload);
    return data.data!;
  },

  async update(id: string, payload: Partial<ReservationPayload>): Promise<Reservation> {
    const { data } = await http.put<ApiResponse<Reservation>>(`/reservations/${id}`, payload);
    return data.data!;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/reservations/${id}`);
  },
};
