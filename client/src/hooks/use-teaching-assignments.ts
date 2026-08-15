import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useMyTeachingAssignments() {
  return useQuery({
    queryKey: ['my-teaching-assignments'],
    queryFn: async () => {
      const res = await apiClient.get('/classes/my-assignments');
      return res.data;
    },
  });
}