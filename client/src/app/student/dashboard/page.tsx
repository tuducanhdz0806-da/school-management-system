'use client';

import { useCurrentStudent } from '@/hooks/use-current-student';

export default function StudentDashboardPage() {
  const { student, isLoading } = useCurrentStudent();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Tổng quan</h1>
      <p className="text-gray-500">
        {isLoading
          ? 'Đang tải...'
          : student
          ? `Xin chào, ${student.fullName}`
          : 'Không tìm thấy thông tin học sinh'}
      </p>
    </div>
  );
}