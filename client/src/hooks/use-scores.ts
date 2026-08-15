import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useClassSubjectScores(classId: number | null, subjectId: number | null, semester: number) {
  return useQuery({
    queryKey: ['class-scores', classId, subjectId, semester],
    queryFn: async () => {
      const res = await apiClient.get(`/scores/class/${classId}/subject/${subjectId}`, {
        params: { semester },
      });
      return res.data;
    },
    enabled: !!classId && !!subjectId,
  });
}

export function useCreateScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      studentId: number;
      subjectId: number;
      scoreType: string;
      value: number;
      semester: number;
    }) => {
      const res = await apiClient.post('/scores', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-scores'] });
    },
  });
}

export function useUpdateScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, value }: { id: number; value: number }) => {
      const res = await apiClient.patch(`/scores/${id}`, { value });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-scores'] });
    },
  });
}