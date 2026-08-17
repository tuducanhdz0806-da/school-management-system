'use client';

import { useState } from 'react';
import { useTeacherDashboard } from '@/hooks/use-teacher-dashboard';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  School,
  Users,
  Clock,
  AlertTriangle,
  QrCode,
  ClipboardList,
  Bell,
  ChevronRight,
} from 'lucide-react';

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

const STATUS_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  ONGOING: { label: 'Đang diễn ra', className: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  UPCOMING: { label: 'Sắp tới', className: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
  FINISHED: { label: 'Đã xong', className: 'bg-gray-50 text-gray-400', dot: 'bg-gray-300' },
};

function KpiCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
  onClick,
}: {
  icon: any;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`rounded-lg border bg-white p-5 flex items-start gap-4 ${onClick ? 'cursor-pointer hover:shadow-sm transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className={`rounded-lg p-3 ${color} shrink-0`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-0.5 truncate">{subtext}</p>}
      </div>
    </div>
  );
}

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [semester] = useState(1);
  const { data, isLoading } = useTeacherDashboard(semester);

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
      value: count as number,
      color: ATTENDANCE_COLORS[status],
    }))
    .filter((d) => d.value > 0);

  const totalAttendanceToday = attendancePieData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Tổng quan</h1>
      <p className="text-gray-500 mb-6">Chào mừng thầy/cô quay lại hệ thống.</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={School}
          label="Số lớp phụ trách"
          value={data.totalClasses}
          subtext={data.classNames.slice(0, 3).join(', ') + (data.classNames.length > 3 ? '...' : '')}
          color="bg-blue-500"
          onClick={() => router.push('/teacher/classes')}
        />
        <KpiCard
          icon={Users}
          label="Tổng số học sinh"
          value={data.totalStudents}
          subtext={`Trên ${data.totalClasses} lớp`}
          color="bg-green-500"
        />
        <KpiCard
          icon={Clock}
          label="Lịch dạy hôm nay"
          value={data.todayLessonCount}
          subtext={
            data.nextLesson
              ? `Tiếp theo: ${data.nextLesson.time} — ${data.nextLesson.className}`
              : 'Không còn tiết nào'
          }
          color="bg-orange-500"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Nhắc nhở công việc"
          value={data.pendingTaskCount}
          subtext={data.latestTaskSummary || 'Không có việc tồn đọng'}
          color={data.pendingTaskCount > 0 ? 'bg-red-500' : 'bg-gray-300'}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main content (2/3) */}
        <div className="col-span-2 space-y-6">
          {/* Lịch dạy hôm nay */}
          <div className="rounded-lg border bg-white">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="font-medium">Lịch dạy hôm nay</h2>
              <span className="text-xs text-gray-400">
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}
              </span>
            </div>
            <div className="divide-y">
              {data.todaySchedules.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  Hôm nay không có lịch dạy 🎉
                </div>
              ) : (
                data.todaySchedules.map((s: any) => {
                  const status = STATUS_CONFIG[s.status];
                  return (
                    <div key={s.id} className="px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center w-12 shrink-0">
                          <p className="text-xs text-gray-400">Tiết</p>
                          <p className="font-semibold">{s.period}</p>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {s.subjectName} — {s.className}
                          </p>
                          <p className="text-xs text-gray-500">
                            {s.startTime} - {s.endTime} · Phòng {s.room || '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={status.className} variant="secondary">
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot} mr-1.5 ${s.status === 'ONGOING' ? 'animate-pulse' : ''}`} />
                          {status.label}
                        </Badge>
                        {s.status === 'ONGOING' && (
                          <Button
                            size="sm"
                            onClick={() => router.push('/teacher/attendance')}
                          >
                            <QrCode className="h-3.5 w-3.5 mr-1.5" />
                            Điểm danh
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Tác vụ cần xử lý */}
          <div className="rounded-lg border bg-white">
            <div className="px-5 py-4 border-b">
              <h2 className="font-medium">Tác vụ cần xử lý</h2>
            </div>
            <div className="divide-y">
              {data.pendingTasks.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  Không có tác vụ nào cần xử lý ✅
                </div>
              ) : (
                data.pendingTasks.map((task: any, i: number) => (
                  <div
                    key={i}
                    className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push('/teacher/scores')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-amber-50 p-2">
                        <ClipboardList className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Lớp {task.className} — {task.subjectName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Còn thiếu điểm cuối kỳ của {task.missingCount}/{task.totalStudents} học sinh
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Pie chart chuyên cần */}
          <div className="rounded-lg border bg-white p-5">
            <h2 className="font-medium mb-4">Chuyên cần hôm nay</h2>
            {attendancePieData.length === 0 ? (
              <p className="text-sm text-gray-500 py-12 text-center">
                Chưa có dữ liệu điểm danh hôm nay
              </p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={attendancePieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                    >
                      {attendancePieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {attendancePieData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                        {d.name}
                      </div>
                      <span className="font-medium">{d.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-sm pt-1.5 border-t mt-1.5">
                    <span className="text-gray-500">Tổng</span>
                    <span className="font-medium">{totalAttendanceToday}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border bg-white p-4 space-y-2">
            <Button
              className="w-full justify-start"
              onClick={() => router.push('/teacher/attendance')}
            >
              <QrCode className="h-4 w-4 mr-2" />
              Quét QR điểm danh nhanh
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/teacher/scores')}
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Nhập điểm lớp học
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <Bell className="h-4 w-4 mr-2" />
              Tạo thông báo mới
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}