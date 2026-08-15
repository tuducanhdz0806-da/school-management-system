'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClasses } from '@/hooks/use-classes';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateClassDialog } from '@/components/classes/create-class-dialog';

export default function ClassesPage() {
  const [gradeTab, setGradeTab] = useState('ALL');
  const gradeLevel = gradeTab === 'ALL' ? undefined : parseInt(gradeTab);
  const { data: classes, isLoading } = useClasses(gradeLevel);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lớp học</h1>
          <p className="text-gray-500">Quản lý các lớp học trong trường</p>
        </div>
        <CreateClassDialog />
      </div>

      <Tabs value={gradeTab} onValueChange={setGradeTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="ALL">Tất cả</TabsTrigger>
          <TabsTrigger value="10">Khối 10</TabsTrigger>
          <TabsTrigger value="11">Khối 11</TabsTrigger>
          <TabsTrigger value="12">Khối 12</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên lớp</TableHead>
              <TableHead>Khối</TableHead>
              <TableHead>Năm học</TableHead>
              <TableHead>GVCN</TableHead>
              <TableHead>Sĩ số</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && classes?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                  Chưa có lớp học nào
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              classes?.map((cls: any) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/classes/${cls.id}`}
                      className="hover:underline text-blue-600"
                    >
                      {cls.gradeLevel}{cls.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Khối {cls.gradeLevel}</Badge>
                  </TableCell>
                  <TableCell>{cls.academicYear?.name}</TableCell>
                  <TableCell>{cls.homeroomTeacher?.fullName || '—'}</TableCell>
                  <TableCell>{cls._count?.classStudents ?? 0} học sinh</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}