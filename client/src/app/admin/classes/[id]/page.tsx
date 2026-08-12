'use client';

import { use } from 'react';
import { useClass, useRemoveStudentFromClass } from '@/hooks/use-classes';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AddStudentDialog } from '@/components/classes/add-student-dialog';
import { UserMinus } from 'lucide-react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const classId = parseInt(id);

  const { data: cls, isLoading } = useClass(classId);
  const removeStudent = useRemoveStudentFromClass(classId);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!cls) {
    return <p className="text-gray-500">Không tìm thấy lớp học</p>;
  }

  const existingStudentIds = cls.classStudents.map((cs: any) => cs.student.id);

  return (
    <div>
      <Link
        href="/admin/classes"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Quay lại danh sách lớp
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Lớp {cls.gradeLevel}{cls.name}
          </h1>
          <p className="text-gray-500">
            Năm học {cls.academicYear?.name} · GVCN: {cls.homeroomTeacher?.fullName || 'Chưa có'}
          </p>
        </div>
        <AddStudentDialog classId={classId} existingStudentIds={existingStudentIds} />
      </div>

      <div className="rounded-lg border bg-white">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="font-medium">Danh sách học sinh</h2>
          <Badge variant="secondary">{cls.classStudents.length} học sinh</Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Ngày sinh</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cls.classStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                  Lớp chưa có học sinh nào
                </TableCell>
              </TableRow>
            )}

            {cls.classStudents.map((cs: any) => (
              <TableRow key={cs.id}>
                <TableCell className="font-medium">{cs.student.fullName}</TableCell>
                <TableCell>
                  {cs.student.dateOfBirth
                    ? new Date(cs.student.dateOfBirth).toLocaleDateString('vi-VN')
                    : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-red-50 text-red-600">
                      <UserMinus className="h-4 w-4" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xóa học sinh khỏi lớp?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Học sinh "{cs.student.fullName}" sẽ bị xóa khỏi lớp{' '}
                          {cls.gradeLevel}{cls.name}. Hồ sơ học sinh vẫn được giữ nguyên trong hệ thống.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => removeStudent.mutate(cs.student.id)}
                        >
                          Xóa khỏi lớp
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}