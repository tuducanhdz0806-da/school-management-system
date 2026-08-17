import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DAY_OF_WEEK_LABELS } from '@/lib/constants';

const DAYS_MAP = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

function getTodayDayOfWeek(): string {
  return DAYS_MAP[new Date().getDay()];
}

function getLessonStatus(startPeriod: number): 'ONGOING' | 'UPCOMING' | 'FINISHED' {
  // Giả định mỗi tiết 45 phút, tiết 1 bắt đầu 7:00
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const periodStartMinutes = 7 * 60 + (startPeriod - 1) * 50;
  const periodEndMinutes = periodStartMinutes + 45;

  if (currentMinutes < periodStartMinutes) return 'UPCOMING';
  if (currentMinutes > periodEndMinutes) return 'FINISHED';
  return 'ONGOING';
}

function periodToTime(period: number): { start: string; end: string } {
  const startMinutes = 7 * 60 + (period - 1) * 50;
  const endMinutes = startMinutes + 45;
  const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  return { start: fmt(startMinutes), end: fmt(endMinutes) };
}

export function useTeacherDashboard(semester: number = 1) {
  return useQuery({
    queryKey: ['teacher-dashboard', semester],
    queryFn: async () => {
      const [assignmentsRes, schedulesRes, tasksRes] = await Promise.all([
        apiClient.get('/classes/my-assignments'),
        apiClient.get('/attendance/my-schedules'),
        apiClient.get('/scores/pending-tasks', { params: { semester } }),
      ]);

      const assignments = assignmentsRes.data;
      const schedules = schedulesRes.data;
      const pendingTasks = tasksRes.data;

      // KPI: Số lớp phụ trách (unique theo classId)
      const uniqueClassIds = new Set(assignments.map((a: any) => a.classId));
      const classNames = assignments
        .filter((a: any, i: number, arr: any[]) => arr.findIndex((x) => x.classId === a.classId) === i)
        .map((a: any) => `${a.class.gradeLevel}${a.class.name}`);

      // KPI: Tổng số học sinh (đếm qua API classes riêng để lấy _count)
      const classesRes = await apiClient.get('/classes');
      const myClasses = classesRes.data.filter((c: any) => uniqueClassIds.has(c.id));
      const totalStudents = myClasses.reduce((sum: number, c: any) => sum + (c._count?.classStudents || 0), 0);

      // Lịch dạy hôm nay
      const today = getTodayDayOfWeek();
      const todaySchedules = schedules
        .filter((s: any) => s.dayOfWeek === today)
        .map((s: any) => {
          const time = periodToTime(s.period);
          return {
            ...s,
            className: `${s.class.gradeLevel}${s.class.name}`,
            subjectName: s.subject.name,
            startTime: time.start,
            endTime: time.end,
            status: getLessonStatus(s.period),
          };
        })
        .sort((a: any, b: any) => a.period - b.period);

      const nextLesson = todaySchedules.find((s: any) => s.status === 'UPCOMING');

      // Điểm danh hôm nay — gộp toàn bộ tiết hôm nay
      const attendanceResults = await Promise.all(
        todaySchedules
          .filter((s: any) => s.status !== 'UPCOMING')
          .map((s: any) =>
            apiClient
              .get(`/attendance/schedule/${s.id}`)
              .then((res) => res.data)
              .catch(() => []),
          ),
      );
      const allAttendance = attendanceResults.flat();
      const attendanceSummary = {
        PRESENT: allAttendance.filter((a: any) => a.status === 'PRESENT').length,
        ABSENT: allAttendance.filter((a: any) => a.status === 'ABSENT').length,
        LATE: allAttendance.filter((a: any) => a.status === 'LATE').length,
        EXCUSED: allAttendance.filter((a: any) => a.status === 'EXCUSED').length,
      };

      return {
        totalClasses: uniqueClassIds.size,
        classNames,
        totalStudents,
        todayLessonCount: todaySchedules.length,
        nextLesson: nextLesson
          ? { time: nextLesson.startTime, className: nextLesson.className }
          : null,
        pendingTaskCount: pendingTasks.length,
        latestTaskSummary:
          pendingTasks.length > 0
            ? `Lớp ${pendingTasks[0].className} chưa nhập điểm ${pendingTasks[0].subjectName}`
            : '',
        todaySchedules,
        pendingTasks,
        attendanceSummary,
      };
    },
  });
}