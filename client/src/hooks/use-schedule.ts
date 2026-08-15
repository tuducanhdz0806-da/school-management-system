import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useMySchedule() {
  return useQuery({
    queryKey: ['my-schedule'],
    queryFn: async () => {
      const res = await apiClient.get('/classes/my-schedule');
      return res.data;
    },
  });
}