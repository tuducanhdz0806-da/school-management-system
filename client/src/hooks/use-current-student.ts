import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

export function useCurrentStudent() {
  const { user } = useAuth();

  const childQuery = useQuery({
    queryKey: ['my-child'],
    queryFn: async () => {
      const res = await apiClient.get('/users/my-child');
      return res.data;
    },
    enabled: user?.role === 'PARENT',
  });

  if (user?.role === 'STUDENT' && user.student) {
    return { student: user.student, isLoading: false };
  }

  if (user?.role === 'PARENT') {
    return { student: childQuery.data, isLoading: childQuery.isLoading };
  }

  return { student: null, isLoading: false };
}