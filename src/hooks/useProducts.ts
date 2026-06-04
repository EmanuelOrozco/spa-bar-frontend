'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, ProductFilters, ProductPayload } from '@/services/product.service';

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.list(filters),
  });
}

export function useProductMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['products'] });

  const create = useMutation({
    mutationFn: (payload: ProductPayload) => productService.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ProductPayload> }) =>
      productService.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
