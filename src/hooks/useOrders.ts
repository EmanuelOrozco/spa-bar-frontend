'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService, OrderFilters, OrderPayload } from '@/services/order.service';

export function useOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => orderService.list(filters),
  });
}

export function useOrderStats() {
  return useQuery({
    queryKey: ['order-stats'],
    queryFn: () => orderService.getStats(),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => orderService.getDashboard(),
  });
}

export function useOrderMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['order-stats'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['tables'] });
  };

  const create = useMutation({
    mutationFn: (payload: OrderPayload) => orderService.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<OrderPayload> }) =>
      orderService.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => orderService.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
