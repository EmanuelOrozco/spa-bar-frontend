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

export interface UpdateProfilePayload {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
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

  async getMe(): Promise<PublicUser> {
    const { data } = await http.get<ApiResponse<PublicUser>>('/auth/me');
    return data.data!;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
    const { data } = await http.patch<ApiResponse<UpdateProfileResponse>>('/auth/me', payload);
    return data.data!;
  },
};
