'use client';

import { useSchedule } from '@/hooks/use-schedule';
import { useCurrentStudent } from '@/hooks/use-current-student';
import { Skeleton } from '@/components/ui/skeleton';
import { DAY_OF_WEEK_LABELS } from '@/lib/constants';

const DAYS_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function SchedulePage() {
  const { student } = useCurrentStudent();
  const { data: schedules, isLoading } = useSchedule(student?.id ?? null);

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  // Nhóm theo thứ
  const byDay: Record<string, any[]> = {};
  DAYS_ORDER.forEach((d) => (byDay[d] = []));
  (schedules || []).forEach((s: any) => {
    if (byDay[s.dayOfWeek]) {
      byDay[s.dayOfWeek].push(s);
    }
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Thời khóa biểu</h1>
      <p className="text-gray-500 mb-6">Lịch học trong tuần</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {DAYS_ORDER.map((day) => (
          <div key={day} className="rounded-lg border bg-white">
            <div className="px-3 py-2.5 border-b bg-gray-50 rounded-t-lg">
              <h3 className="font-medium text-sm text-center">{DAY_OF_WEEK_LABELS[day]}</h3>
            </div>
            <div className="p-2 space-y-2 min-h-[200px]">
              {byDay[day].length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">Không có tiết</p>
              )}
              {byDay[day]
                .sort((a, b) => a.period - b.period)
                .map((s: any) => (
                  <div
                    key={s.id}
                    className="rounded-md bg-blue-50 border border-blue-100 p-2 text-xs"
                  >
                    <p className="font-medium text-blue-900">Tiết {s.period}</p>
                    <p className="text-blue-700">{s.subject.name}</p>
                    <p className="text-blue-500">{s.teacher.fullName}</p>
                    {s.room && <p className="text-blue-400">Phòng {s.room}</p>}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}