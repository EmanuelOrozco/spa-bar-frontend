import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '@/types';

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export const http = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,
});

let isRedirecting = false;

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('spa-bar-token');
}

function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('spa-bar-refresh-token');
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('spa-bar-token', accessToken);
  localStorage.setItem('spa-bar-refresh-token', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('spa-bar-token');
  localStorage.removeItem('spa-bar-refresh-token');
  localStorage.removeItem('spa-bar-user');
}

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config;
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthRoute && typeof window !== 'undefined') {
      const refreshToken = getStoredRefreshToken();

      if (refreshToken && originalRequest && !('_retry' in originalRequest)) {
        try {
          const { data } = await axios.post<
            ApiResponse<{ accessToken: string; refreshToken: string }>
          >(`${baseURL}/auth/refresh`, { refreshToken });

          if (data.data) {
            setTokens(data.data.accessToken, data.data.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
            (originalRequest as InternalAxiosRequestConfig & { _retry?: boolean })._retry = true;
            return http(originalRequest);
          }
        } catch {
          // fall through to logout
        }
      }

      if (!isRedirecting) {
        isRedirecting = true;
        clearTokens();
        window.location.href = '/login?session=expired';
      }
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown, fallback = 'Ocurrió un error'): string {
  if (axios.isAxiosError<ApiResponse>(error)) {
    return error.response?.data?.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError<ApiResponse>(error) && error.response?.data?.details) {
    const result: Record<string, string> = {};
    for (const [key, messages] of Object.entries(error.response.data.details)) {
      result[key] = messages[0] ?? '';
    }
    return result;
  }
  return {};
}
