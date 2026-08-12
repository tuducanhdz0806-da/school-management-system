import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { AcademicYear } from '@/lib/types';

export function useAcademicYears() {
  return useQuery<AcademicYear[]>({
    queryKey: ['academic-years'],
    queryFn: async () => {
      const res = await apiClient.get('/academic-years');
      return res.data;
    },
  });
}
