import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await apiClient.get('/notifications');
      return res.data;
    },
  });
}