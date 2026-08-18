'use client';

import { useState, useCallback } from 'react';
import {
  useMySchedules,
  useCreateAttendanceSession,
  useAttendanceBySchedule,
} from '@/hooks/use-attendance';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '@/components/attendance/countdown-timer';
import { DAY_OF_WEEK_LABELS, ATTENDANCE_STATUS_LABELS, ATTENDANCE_STATUS_COLORS } from '@/lib/constants';
import { QrCode } from 'lucide-react';

export default function TeacherAttendancePage() {
  const { data: schedules } = useMySchedules();
  const createSession = useCreateAttendanceSession();

  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [session, setSession] = useState<{
    token: string;
    expiresAt: string;
    qrImage: string;
  } | null>(null);
  const [expired, setExpired] = useState(false);

  const activeScheduleId = session ? parseInt(selectedScheduleId) : null;
  const { data: attendanceList } = useAttendanceBySchedule(activeScheduleId);

  const handleExpire = useCallback(() => {
    setExpired(true);
  }, []);

  async function handleCreateSession() {
    if (!selectedScheduleId) return;
    setExpired(false);
    const result = await createSession.mutateAsync(parseInt(selectedScheduleId));
    setSession(result);
  }

  const selectedSchedule = schedules?.find(
    (s: any) => String(s.id) === selectedScheduleId,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Điểm danh QR</h1>
        <p className="text-gray-500">Tạo mã QR để học sinh điểm danh vào tiết học</p>
      </div>

      {/* Phần trên: QR full-width, kích thước lớn */}
      <div className="rounded-lg border bg-white p-6">
        <div className="max-w-xs mx-auto mb-5">
          <label className="text-sm font-medium mb-2 block">Chọn tiết học</label>
          <Select
            value={selectedScheduleId}
            onValueChange={(value) => {
              setSelectedScheduleId(value ?? '');
              setSession(null);
              setExpired(false);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn tiết học">
                {selectedSchedule &&
                  `${selectedSchedule.class.gradeLevel}${selectedSchedule.class.name} — ${selectedSchedule.subject.name} (${DAY_OF_WEEK_LABELS[selectedSchedule.dayOfWeek]}, tiết ${selectedSchedule.period})`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(schedules || []).map((s: any) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.class.gradeLevel}{s.class.name} — {s.subject.name} (
                  {DAY_OF_WEEK_LABELS[s.dayOfWeek]}, tiết {s.period})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!session || expired ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Button
              size="lg"
              disabled={!selectedScheduleId || createSession.isPending}
              onClick={handleCreateSession}
            >
              <QrCode className="h-5 w-5 mr-2" />
              {createSession.isPending
                ? 'Đang tạo...'
                : expired
                  ? 'Tạo mã QR mới'
                  : 'Tạo mã QR điểm danh'}
            </Button>
            {expired && (
              <p className="text-sm text-red-600 mt-3">
                Mã QR đã hết hạn, vui lòng tạo mã mới
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
            <img
              src={session.qrImage}
              alt="QR điểm danh"
              className="w-full max-w-md aspect-square border rounded-xl shadow-sm"
            />
            <CountdownTimer expiresAt={session.expiresAt} onExpire={handleExpire} />
            <p className="text-sm text-gray-500">Mã QR sẽ hết hạn sau 5 phút</p>
          </div>
        )}
      </div>

      {/* Phần dưới: Danh sách đã điểm danh */}
      <div className="rounded-lg border bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium">Học sinh đã điểm danh</h2>
          {session && !expired && (
            <Badge variant="secondary" className="animate-pulse">
              Đang cập nhật...
            </Badge>
          )}
        </div>

        {!session ? (
          <p className="text-sm text-gray-500 py-8 text-center">
            Chọn tiết học và tạo mã QR để bắt đầu điểm danh
          </p>
        ) : (attendanceList || []).length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">
            Chưa có học sinh nào điểm danh
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {attendanceList.map((a: any) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <span className="font-medium text-sm truncate">{a.student.fullName}</span>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {a.checkedByQr && (
                    <Badge variant="secondary" className="text-xs">
                      <QrCode className="h-3 w-3 mr-1" />
                      QR
                    </Badge>
                  )}
                  <Badge className={ATTENDANCE_STATUS_COLORS[a.status]} variant="secondary">
                    {ATTENDANCE_STATUS_LABELS[a.status]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}