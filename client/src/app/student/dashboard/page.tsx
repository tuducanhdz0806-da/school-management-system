'use client';

import { useRouter } from 'next/navigation';
import { useCurrentStudent } from '@/hooks/use-current-student';
import { useStudentDashboard } from '@/hooks/use-student-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  GraduationCap,
  CalendarCheck,
  Bell,
  QrCode,
  CalendarDays,
  ChevronRight,
} from 'lucide-react';
import { SCORE_TYPE_LABELS } from '@/lib/constants';

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
  badge,
  color,
  onClick,
}: {
  icon: any;
  label: string;
  value: string | number;
  subtext?: string;
  badge?: { label: string; className: string };
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
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold">{value}</p>
          {badge && (
            <Badge className={badge.className} variant="secondary">
              {badge.label}
            </Badge>
          )}
        </div>
        {subtext && <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const { student } = useCurrentStudent();
  const { data, isLoading } = useStudentDashboard(student?.id ?? null);

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Tổng quan</h1>
      <p className="text-gray-500 mb-6">
        {student ? `Xin chào, ${student.fullName}` : 'Chào mừng quay lại'}
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <KpiCard
          icon={GraduationCap}
          label="Điểm trung bình tích lũy"
          value={data.averageScore > 0 ? data.averageScore : '—'}
          badge={data.averageScore > 0 ? data.classification : undefined}
          color="bg-blue-500"
          onClick={() => router.push('/student/scores')}
        />
        <KpiCard
          icon={CalendarCheck}
          label="Tỷ lệ chuyên cần"
          value={`${data.attendanceRate}%`}
          subtext={`${data.presentCount}/${data.totalSessions} buổi có mặt`}
          color={data.attendanceRate >= 90 ? 'bg-green-500' : 'bg-amber-500'}
        />
        <KpiCard
          icon={Bell}
          label="Thông báo mới"
          value={data.unreadCount}
          subtext={data.latestNotificationTitle || 'Không có thông báo'}
          color="bg-purple-500"
          onClick={() => router.push('/student/notifications')}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main content (2/3) */}
        <div className="col-span-2 space-y-6">
          {/* Thời khóa biểu hôm nay */}
          <div className="rounded-lg border bg-white">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="font-medium">Thời khóa biểu hôm nay</h2>
              <span className="text-xs text-gray-400">
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}
              </span>
            </div>
            <div className="divide-y">
              {data.todaySchedules.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  Hôm nay không có tiết học nào 🎉
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
                          <p className="font-medium text-sm">{s.subjectName}</p>
                          <p className="text-xs text-gray-500">
                            {s.startTime} - {s.endTime} · Phòng {s.room || '—'} · GV: {s.teacherName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={status.className} variant="secondary">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${status.dot} mr-1.5 ${s.status === 'ONGOING' ? 'animate-pulse' : ''}`}
                          />
                          {status.label}
                        </Badge>
                        {s.status === 'ONGOING' && (
                          <Button size="sm" onClick={() => router.push('/student/attendance')}>
                            <QrCode className="h-3.5 w-3.5 mr-1.5" />
                            Điểm danh QR
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Điểm số gần đây */}
          <div className="rounded-lg border bg-white">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="font-medium">Điểm số gần đây</h2>
              <button
                onClick={() => router.push('/student/scores')}
                className="text-xs text-blue-600 hover:underline flex items-center"
              >
                Xem tất cả <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {data.recentScores.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">Chưa có điểm nào</div>
            ) : (
              <div className="divide-y">
                {data.recentScores.map((s: any, i: number) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{s.subjectName}</span>
                      <span className="text-gray-400"> · {SCORE_TYPE_LABELS[s.scoreType]}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`font-semibold ${s.value >= 8 ? 'text-green-600' : s.value >= 5 ? 'text-amber-600' : 'text-red-600'}`}
                      >
                        {s.value}
                      </span>
                      <span className="text-xs text-gray-400 w-20 text-right">
                        {new Date(s.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Line chart xu hướng điểm */}
            {data.chartData.length > 1 && (
              <div className="p-5 border-t">
                <p className="text-xs text-gray-500 mb-3">Xu hướng điểm số gần đây</p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={data.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" fontSize={11} />
                    <YAxis domain={[0, 10]} fontSize={11} allowDecimals={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#1e293b"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Sự kiện sắp tới - placeholder vì chưa có model */}
          <div className="rounded-lg border bg-white p-5">
            <h2 className="font-medium mb-3">Sự kiện & Lịch thi sắp tới</h2>
            <p className="text-sm text-gray-400 text-center py-8">
              Chưa có sự kiện nào sắp tới 📚
            </p>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border bg-white p-4 space-y-2">
            <Button
              className="w-full justify-start"
              onClick={() => router.push('/student/attendance')}
            >
              <QrCode className="h-4 w-4 mr-2" />
              Mở mã QR điểm danh
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/student/schedule')}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Xem thời khóa biểu tuần
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}