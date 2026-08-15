'use client';

import { useState } from 'react';
import { useCurrentStudent } from '@/hooks/use-current-student';
import { useStudentScores, useStudentAverage } from '@/hooks/use-student-scores';
import { downloadStudentReport } from '@/lib/download-report';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SCORE_TYPE_LABELS } from '@/lib/constants';
import { Download } from 'lucide-react';

export default function StudentScoresPage() {
  const [semester, setSemester] = useState('1');
  const { student } = useCurrentStudent();
  const studentId = student?.id ?? null;

  const { data: scores, isLoading } = useStudentScores(studentId, parseInt(semester));
  const { data: average } = useStudentAverage(studentId, parseInt(semester));

  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!studentId || !student) return;
    setDownloading(true);
    try {
      await downloadStudentReport(studentId, parseInt(semester), student.fullName);
    } finally {
      setDownloading(false);
    }
  }

  // Nhóm điểm theo môn
  const bySubject: Record<number, { name: string; scores: any[] }> = {};
  (scores || []).forEach((s: any) => {
    if (!bySubject[s.subjectId]) {
      bySubject[s.subjectId] = { name: s.subject.name, scores: [] };
    }
    bySubject[s.subjectId].scores.push(s);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Điểm số</h1>
          <p className="text-gray-500">Xem điểm chi tiết theo từng môn học</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={semester} onValueChange={(v) => setSemester(v ?? '1')}>
            <SelectTrigger className="w-32">
              <SelectValue>Học kỳ {semester}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Học kỳ 1</SelectItem>
              <SelectItem value="2">Học kỳ 2</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleDownload} disabled={downloading || !studentId}>
            <Download className="h-4 w-4 mr-2" />
            {downloading ? 'Đang tải...' : 'Xuất phiếu điểm PDF'}
          </Button>
        </div>
      </div>

      {average && (
        <div className="rounded-lg border bg-white p-5 mb-6">
          <p className="text-sm text-gray-500 mb-1">Điểm trung bình học kỳ {semester}</p>
          <p className="text-3xl font-bold">
            {average.overallAverage > 0 ? average.overallAverage : '—'}
            {average.overallAverage > 0 && (
              <span className="text-base font-normal text-gray-400"> / 10</span>
            )}
          </p>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : Object.keys(bySubject).length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
          Chưa có điểm nào trong học kỳ này
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(bySubject).map(([subjectId, data]) => (
            <div key={subjectId} className="rounded-lg border bg-white p-5">
              <h3 className="font-semibold mb-3">{data.name}</h3>
              <div className="flex flex-wrap gap-1.5">
                {data.scores.map((s: any) => (
                  <Badge key={s.id} variant="secondary">
                    {SCORE_TYPE_LABELS[s.scoreType]}: {s.value}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}