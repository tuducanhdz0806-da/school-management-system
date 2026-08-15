import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useCheckIn() {
  return useMutation({
    mutationFn: async (token: string) => {
      const res = await apiClient.post('/attendance/check-in', { token });
      return res.data;
    },
  });
}