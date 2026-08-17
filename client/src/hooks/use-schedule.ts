import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useSchedule(studentId: number | null) {
  return useQuery({
    queryKey: ['schedule', studentId],
    queryFn: async () => {
      const res = await apiClient.get(`/classes/schedule/${studentId}`);
      return res.data;
    },
    enabled: !!studentId,
  });
}