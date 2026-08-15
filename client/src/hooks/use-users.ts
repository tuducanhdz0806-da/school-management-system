import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { User } from '@/lib/types';

export function useUsers(role?: string) {
  return useQuery<User[]>({
    queryKey: ['users', role],
    queryFn: async () => {
      const res = await apiClient.get('/users', { params: role ? { role } : {} });
      return res.data;
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/users/${id}`);
    },
    onSuccess: () => {
      // Xóa xong tự động refetch lại danh sách, không cần reload trang
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}