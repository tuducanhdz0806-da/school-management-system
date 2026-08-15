import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useMySchedules() {
  return useQuery({
    queryKey: ['my-schedules'],
    queryFn: async () => {
      const res = await apiClient.get('/attendance/my-schedules');
      return res.data;
    },
  });
}

export function useCreateAttendanceSession() {
  return useMutation({
    mutationFn: async (scheduleId: number) => {
      const res = await apiClient.post('/attendance/sessions', { scheduleId });
      return res.data;
    },
  });
}

export function useAttendanceBySchedule(scheduleId: number | null) {
  return useQuery({
    queryKey: ['attendance-by-schedule', scheduleId],
    queryFn: async () => {
      const res = await apiClient.get(`/attendance/schedule/${scheduleId}`);
      return res.data;
    },
    enabled: !!scheduleId,
    refetchInterval: 3000, // tự động fetch lại mỗi 3 giây — tạo cảm giác "real-time"
  });
}