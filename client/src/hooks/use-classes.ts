import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Class } from '@/lib/types';

export function useClasses(gradeLevel?: number) {
  return useQuery<Class[]>({
    queryKey: ['classes', gradeLevel],
    queryFn: async () => {
      const res = await apiClient.get('/classes', {
        params: gradeLevel ? { gradeLevel } : {},
      });
      return res.data;
    },
  });
}

export function useClass(id: number) {
  return useQuery({
    queryKey: ['classes', id],
    queryFn: async () => {
      const res = await apiClient.get(`/classes/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      gradeLevel: number;
      academicYearId: number;
      homeroomTeacherId?: number;
    }) => {
      const res = await apiClient.post('/classes', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}

export function useAddStudentToClass(classId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studentId: number) => {
      const res = await apiClient.post(`/classes/${classId}/students`, { studentId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes', classId] });
    },
  });
}

export function useRemoveStudentFromClass(classId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studentId: number) => {
      await apiClient.delete(`/classes/${classId}/students/${studentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes', classId] });
    },
  });
}