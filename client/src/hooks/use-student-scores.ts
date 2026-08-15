import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useStudentScores(studentId: number | null, semester: number) {
  return useQuery({
    queryKey: ['student-scores', studentId, semester],
    queryFn: async () => {
      const res = await apiClient.get(`/scores/student/${studentId}`, {
        params: { semester },
      });
      return res.data;
    },
    enabled: !!studentId,
  });
}

export function useStudentAverage(studentId: number | null, semester: number) {
  return useQuery({
    queryKey: ['student-average', studentId, semester],
    queryFn: async () => {
      const res = await apiClient.get(`/scores/student/${studentId}/average`, {
        params: { semester },
      });
      return res.data;
    },
    enabled: !!studentId,
  });
}