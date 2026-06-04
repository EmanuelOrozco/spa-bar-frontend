'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  tableService,
  reservationService,
  TableFilters,
  TablePayload,
  ReservationFilters,
  ReservationPayload,
} from '@/services/table.service';

export function useTables(filters: TableFilters = {}) {
  return useQuery({
    queryKey: ['tables', filters],
    queryFn: () => tableService.list(filters),
  });
}

export function useReservations(filters: ReservationFilters = {}) {
  return useQuery({
    queryKey: ['reservations', filters],
    queryFn: () => reservationService.list(filters),
  });
}

export function useTableMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['tables'] });
    queryClient.invalidateQueries({ queryKey: ['reservations'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  };

  const createTable = useMutation({
    mutationFn: (payload: TablePayload) => tableService.create(payload),
    onSuccess: invalidate,
  });

  const updateTable = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TablePayload> }) =>
      tableService.update(id, payload),
    onSuccess: invalidate,
  });

  const updateTableStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TablePayload['status'] }) =>
      tableService.updateStatus(id, status!),
    onSuccess: invalidate,
  });

  const createReservation = useMutation({
    mutationFn: (payload: ReservationPayload) => reservationService.create(payload),
    onSuccess: invalidate,
  });

  const updateReservation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ReservationPayload> }) =>
      reservationService.update(id, payload),
    onSuccess: invalidate,
  });

  const removeReservation = useMutation({
    mutationFn: (id: string) => reservationService.remove(id),
    onSuccess: invalidate,
  });

  const removeTable = useMutation({
    mutationFn: (id: string) => tableService.remove(id),
    onSuccess: invalidate,
  });

  return {
    createTable,
    updateTable,
    updateTableStatus,
    removeTable,
    createReservation,
    updateReservation,
    removeReservation,
  };
}
