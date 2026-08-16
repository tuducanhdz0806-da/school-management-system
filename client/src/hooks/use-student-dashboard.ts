import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

const DAYS_MAP = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

function getTodayDayOfWeek(): string {
  return DAYS_MAP[new Date().getDay()];
}

function getLessonStatus(period: number): 'ONGOING' | 'UPCOMING' | 'FINISHED' {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const periodStartMinutes = 7 * 60 + (period - 1) * 50;
  const periodEndMinutes = periodStartMinutes + 45;

  if (currentMinutes < periodStartMinutes) return 'UPCOMING';
  if (currentMinutes > periodEndMinutes) return 'FINISHED';
  return 'ONGOING';
}

function periodToTime(period: number): { start: string; end: string } {
  const startMinutes = 7 * 60 + (period - 1) * 50;
  const endMinutes = startMinutes + 45;
  const fmt = (m: number) =>
    `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  return { start: fmt(startMinutes), end: fmt(endMinutes) };
}

function classifyAverage(avg: number): { label: string; className: string } {
  if (avg >= 8) return { label: 'Giỏi', className: 'bg-green-100 text-green-700' };
  if (avg >= 6.5) return { label: 'Khá', className: 'bg-blue-100 text-blue-700' };
  if (avg >= 5) return { label: 'Trung bình', className: 'bg-amber-100 text-amber-700' };
  return { label: 'Yếu', className: 'bg-red-100 text-red-700' };
}

export function useStudentDashboard(studentId: number | null, semester: number = 1) {
  return useQuery({
    queryKey: ['student-dashboard', studentId, semester],
    queryFn: async () => {
      const [scheduleRes, averageRes, scoresRes, notificationsRes, statsRes] = await Promise.all([
        apiClient.get(`/classes/schedule/${studentId}`),
        apiClient.get(`/scores/student/${studentId}/average`, { params: { semester } }),
        apiClient.get(`/scores/student/${studentId}`, { params: { semester } }),
        apiClient.get('/notifications'),
        apiClient.get(`/attendance/stats/${studentId}`),
      ]);

      const schedules = scheduleRes.data;
      const average = averageRes.data;
      const scores = scoresRes.data;
      const notifications = notificationsRes.data;
      const stats = statsRes.data;

      // Thời khóa biểu hôm nay
      const today = getTodayDayOfWeek();
      const todaySchedules = schedules
        .filter((s: any) => s.dayOfWeek === today)
        .map((s: any) => {
          const time = periodToTime(s.period);
          return {
            ...s,
            subjectName: s.subject.name,
            teacherName: s.teacher.fullName,
            startTime: time.start,
            endTime: time.end,
            status: getLessonStatus(s.period),
          };
        })
        .sort((a: any, b: any) => a.period - b.period);

      // Điểm số gần đây — sắp xếp theo ngày nhập, lấy 5 mới nhất
      const recentScores = [...scores]
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((s: any) => ({
          subjectName: s.subject.name,
          scoreType: s.scoreType,
          value: s.value,
          createdAt: s.createdAt,
        }));

      // Line chart: nhóm điểm theo ngày, tính điểm trung bình cộng giản đơn của các điểm nhập trong ngày đó
      const byDate: Record<string, number[]> = {};
      scores.forEach((s: any) => {
        const date = new Date(s.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        if (!byDate[date]) byDate[date] = [];
        byDate[date].push(s.value);
      });
      const chartData = Object.entries(byDate)
        .map(([date, values]) => ({
          date,
          score: parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)),
        }))
        .slice(-10); // chỉ lấy 10 điểm gần nhất để biểu đồ không quá rối

      const unreadCount = notifications.length; // hệ thống hiện chưa có field "đã đọc", tạm coi tất cả là chưa đọc
      const latestNotificationTitle = notifications[0]?.title ?? '';

      const classification = classifyAverage(average.overallAverage || 0);

      return {
        averageScore: average.overallAverage || 0,
        classification,
        subjectAverages: average.subjectAverages || [],
        attendanceRate: stats.attendanceRate,
        presentCount: stats.presentCount,
        totalSessions: stats.totalSessions,
        unreadCount,
        latestNotificationTitle,
        todaySchedules,
        recentScores,
        chartData,
      };
    },
    enabled: !!studentId,
  });
}