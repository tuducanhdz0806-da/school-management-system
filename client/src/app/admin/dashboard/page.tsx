'use client';

import { useDashboardStats } from '@/hooks/use-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Users, GraduationCap, School, BookOpen } from 'lucide-react';

const ATTENDANCE_COLORS: Record<string, string> = {
  PRESENT: '#22c55e',
  ABSENT: '#ef4444',
  LATE: '#f59e0b',
  EXCUSED: '#6366f1',
};

const ATTENDANCE_LABELS: Record<string, string> = {
  PRESENT: 'Có mặt',
  ABSENT: 'Vắng',
  LATE: 'Trễ',
  EXCUSED: 'Có phép',
};

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-5 flex items-center gap-4">
      <div className={`rounded-lg p-3 ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const attendancePieData = Object.entries(data.attendanceSummary)
    .map(([status, count]) => ({
      name: ATTENDANCE_LABELS[status],
      value: count,
      color: ATTENDANCE_COLORS[status],
    }))
    .filter((d) => d.value > 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Tổng quan</h1>
      <p className="text-gray-500 mb-6">Chào mừng quay lại hệ thống quản lý.</p>

      {/* Thẻ thống kê nhanh */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={GraduationCap}
          label="Học sinh"
          value={data.usersByRole.STUDENT}
          color="bg-green-500"
        />
        <StatCard
          icon={Users}
          label="Giáo viên"
          value={data.usersByRole.TEACHER}
          color="bg-blue-500"
        />
        <StatCard
          icon={School}
          label="Lớp học"
          value={data.totalClasses}
          color="bg-purple-500"
        />
        <StatCard
          icon={BookOpen}
          label="Môn học"
          value={data.totalSubjects}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Biểu đồ sĩ số theo khối */}
        <div className="col-span-2 rounded-lg border bg-white p-5">
          <h2 className="font-medium mb-4">Sĩ số theo khối</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.classesByGrade}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="grade" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="students" name="Số học sinh" fill="#1e293b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ tròn điểm danh hôm nay */}
        <div className="rounded-lg border bg-white p-5">
          <h2 className="font-medium mb-4">Điểm danh hôm nay</h2>
          {attendancePieData.length === 0 ? (
            <p className="text-sm text-gray-500 py-16 text-center">
              Chưa có dữ liệu điểm danh hôm nay
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={attendancePieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {attendancePieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Điểm trung bình toàn trường */}
      <div className="mt-6 rounded-lg border bg-white p-5">
        <h2 className="font-medium mb-1">Điểm trung bình toàn trường (Học kỳ 1)</h2>
        <p className="text-3xl font-bold text-gray-900">
          {data.schoolAverage > 0 ? data.schoolAverage : '—'}
          {data.schoolAverage > 0 && <span className="text-base font-normal text-gray-400"> / 10</span>}
        </p>
      </div>
    </div>
  );
}