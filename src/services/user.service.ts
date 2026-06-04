import { http } from './http';
import { ApiResponse, PublicUser, Role, PaginationMeta } from '@/types';

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  isActive?: boolean;
}

export interface UserPayload {
  name: string;
  email: string;
  password?: string;
  role?: Role;
  position?: string | null;
  isActive?: boolean;
}

export const userService = {
  async list(filters: UserFilters = {}): Promise<{ data: PublicUser[]; meta: PaginationMeta }> {
    const { data } = await http.get<ApiResponse<PublicUser[]>>('/users', { params: filters });
    return { data: data.data ?? [], meta: data.meta! };
  },

  async getById(id: string): Promise<PublicUser> {
    const { data } = await http.get<ApiResponse<PublicUser>>(`/users/${id}`);
    return data.data!;
  },

  async create(payload: UserPayload & { password: string }): Promise<PublicUser> {
    const { data } = await http.post<ApiResponse<PublicUser>>('/users', payload);
    return data.data!;
  },

  async update(id: string, payload: Partial<UserPayload>): Promise<PublicUser> {
    const { data } = await http.put<ApiResponse<PublicUser>>(`/users/${id}`, payload);
    return data.data!;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/users/${id}`);
  },
};
