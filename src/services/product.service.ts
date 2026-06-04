import { http } from './http';
import { ApiResponse, Product, ProductCategory, ProductStatus, PaginationMeta } from '@/types';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: ProductCategory;
  status?: ProductStatus;
  isMenuItem?: boolean;
  lowStock?: boolean;
  includeImage?: boolean;
}

export interface ProductPayload {
  sku: string;
  name: string;
  description?: string | null;
  category: ProductCategory;
  price: number;
  stock?: number;
  minStock?: number;
  unit?: string;
  status?: ProductStatus;
  imageData?: string | null;
  isMenuItem?: boolean;
}

export const productService = {
  async list(filters: ProductFilters = {}): Promise<{ data: Product[]; meta: PaginationMeta }> {
    const params: Record<string, string | number | boolean> = { ...filters };
    if (filters.includeImage !== undefined) {
      params.includeImage = filters.includeImage ? 'true' : 'false';
    }
    if (filters.isMenuItem !== undefined) {
      params.isMenuItem = filters.isMenuItem ? 'true' : 'false';
    }
    if (filters.lowStock !== undefined) {
      params.lowStock = filters.lowStock ? 'true' : 'false';
    }

    const { data } = await http.get<ApiResponse<Product[]>>('/products', { params });
    return { data: data.data ?? [], meta: data.meta! };
  },

  async getById(id: string): Promise<Product> {
    const { data } = await http.get<ApiResponse<Product>>(`/products/${id}`);
    return data.data!;
  },

  async create(payload: ProductPayload): Promise<Product> {
    const { data } = await http.post<ApiResponse<Product>>('/products', payload);
    return data.data!;
  },

  async update(id: string, payload: Partial<ProductPayload>): Promise<Product> {
    const { data } = await http.put<ApiResponse<Product>>(`/products/${id}`, payload);
    return data.data!;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/products/${id}`);
  },
};
