import { http } from './http';
import { ApiResponse, LoginResponse, PublicUser } from '@/types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  position?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<PublicUser> {
    const { data } = await http.post<ApiResponse<PublicUser>>('/auth/register', payload);
    return data.data!;
  },

  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await http.post<ApiResponse<LoginResponse>>('/auth/login', payload);
    return data.data!;
  },
};
