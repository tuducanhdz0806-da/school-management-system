import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [usersRes, classesRes, subjectsRes] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/classes'),
        apiClient.get('/subjects'),
      ]);

      const users = usersRes.data;
      const classes = classesRes.data;
      const subjects = subjectsRes.data;

      // Đếm user theo role
      const usersByRole = {
        ADMIN: users.filter((u: any) => u.role === 'ADMIN').length,
        TEACHER: users.filter((u: any) => u.role === 'TEACHER').length,
        STUDENT: users.filter((u: any) => u.role === 'STUDENT').length,
        PARENT: users.filter((u: any) => u.role === 'PARENT').length,
      };

      // Đếm lớp theo khối
      const classesByGrade = [10, 11, 12].map((grade) => ({
        grade: `Khối ${grade}`,
        count: classes.filter((c: any) => c.gradeLevel === grade).length,
        students: classes
          .filter((c: any) => c.gradeLevel === grade)
          .reduce((sum: number, c: any) => sum + (c._count?.classStudents || 0), 0),
      }));

      const totalStudentsInClasses = classes.reduce(
        (sum: number, c: any) => sum + (c._count?.classStudents || 0),
        0,
      );

      // Thống kê điểm danh HÔM NAY của tất cả lớp
      const attendanceResults = await Promise.all(
        classes.map((c: any) =>
          apiClient
            .get(`/attendance/class/${c.id}`)
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

      // Điểm trung bình toàn trường (học kỳ 1) — lấy từ danh sách học sinh
      const students = users.filter((u: any) => u.role === 'STUDENT' && u.student);
      const averageResults = await Promise.all(
        students.map((s: any) =>
          apiClient
            .get(`/scores/student/${s.student.id}/average?semester=1`)
            .then((res) => res.data.overallAverage)
            .catch(() => null),
        ),
      );
      const validAverages = averageResults.filter((a) => a !== null && a > 0);
      const schoolAverage =
        validAverages.length > 0
          ? validAverages.reduce((sum, a) => sum + a, 0) / validAverages.length
          : 0;

      return {
        usersByRole,
        classesByGrade,
        totalClasses: classes.length,
        totalSubjects: subjects.length,
        totalStudentsInClasses,
        attendanceSummary,
        schoolAverage: parseFloat(schoolAverage.toFixed(2)),
      };
    },
  });
}