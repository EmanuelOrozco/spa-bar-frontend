'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, UserFilters, UserPayload } from '@/services/user.service';

export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.list(filters),
  });
}

export function useUserMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users'] });

  const create = useMutation({
    mutationFn: (payload: UserPayload & { password: string }) => userService.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<UserPayload> }) =>
      userService.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
