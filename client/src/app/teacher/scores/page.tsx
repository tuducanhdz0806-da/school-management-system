'use client';

import { useState } from 'react';
import { useMyTeachingAssignments } from '@/hooks/use-teaching-assignments';
import { useClassSubjectScores } from '@/hooks/use-scores';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AddScoreDialog } from '@/components/scores/add-score-dialog';
import { SCORE_TYPE_LABELS } from '@/lib/constants';

export default function TeacherScoresPage() {
  const { data: assignments } = useMyTeachingAssignments();
  const [assignmentKey, setAssignmentKey] = useState('');
  const [semester, setSemester] = useState('1');

  const selectedAssignment = (assignments || []).find(
    (a: any) => `${a.classId}-${a.subjectId}` === assignmentKey,
  );

  const { data: classScores, isLoading } = useClassSubjectScores(
    selectedAssignment?.classId ?? null,
    selectedAssignment?.subjectId ?? null,
    parseInt(semester),
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Nhập điểm</h1>
      <p className="text-gray-500 mb-6">Nhập và quản lý điểm số cho học sinh</p>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 max-w-sm">
          <Select
            value={assignmentKey}
            onValueChange={(v) => setAssignmentKey(v ?? '')}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn lớp — môn học">
                {selectedAssignment &&
                  `${selectedAssignment.class.gradeLevel}${selectedAssignment.class.name} — ${selectedAssignment.subject.name}`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(assignments || []).map((a: any) => (
                <SelectItem key={`${a.classId}-${a.subjectId}`} value={`${a.classId}-${a.subjectId}`}>
                  {a.class.gradeLevel}{a.class.name} — {a.subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Select value={semester} onValueChange={(v) => setSemester(v ?? '1')}>
          <SelectTrigger className="w-32">
            <SelectValue>Học kỳ {semester}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Học kỳ 1</SelectItem>
            <SelectItem value="2">Học kỳ 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!selectedAssignment ? (
        <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
          Vui lòng chọn lớp và môn học để xem bảng điểm
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Học sinh</TableHead>
                <TableHead>Điểm đã nhập</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={3}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoading &&
                (classScores || []).map((row: any) => (
                  <TableRow key={row.studentId}>
                    <TableCell className="font-medium">{row.studentName}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {row.scores.length === 0 && (
                          <span className="text-sm text-gray-400">Chưa có điểm</span>
                        )}
                        {row.scores.map((s: any) => (
                          <Badge key={s.id} variant="secondary">
                            {SCORE_TYPE_LABELS[s.scoreType]}: {s.value}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <AddScoreDialog
                        studentId={row.studentId}
                        studentName={row.studentName}
                        subjectId={selectedAssignment.subjectId}
                        semester={parseInt(semester)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}