'use client';

import { useState } from 'react';
import { useUsers, useDeleteUser } from '@/hooks/use-users';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2 } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Quản trị',
  TEACHER: 'Giáo viên',
  STUDENT: 'Học sinh',
  PARENT: 'Phụ huynh',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  TEACHER: 'bg-blue-100 text-blue-700',
  STUDENT: 'bg-green-100 text-green-700',
  PARENT: 'bg-orange-100 text-orange-700',
};

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const { data: users, isLoading } = useUsers(roleFilter === 'ALL' ? undefined : roleFilter);
  const deleteUser = useDeleteUser();

  function getFullName(user: any): string {
    return (
      user.admin?.fullName ||
      user.teacher?.fullName ||
      user.student?.fullName ||
      user.parent?.fullName ||
      '—'
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Người dùng</h1>
          <p className="text-gray-500">Quản lý tài khoản trong hệ thống</p>
        </div>
        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value ?? 'ALL')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Lọc theo vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="ADMIN">Quản trị</SelectItem>
            <SelectItem value="TEACHER">Giáo viên</SelectItem>
            <SelectItem value="STUDENT">Học sinh</SelectItem>
            <SelectItem value="PARENT">Phụ huynh</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && users?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                  Không có người dùng nào
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              users?.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{getFullName(user)}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={ROLE_COLORS[user.role]} variant="secondary">
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-red-50 text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa tài khoản?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tài khoản "{getFullName(user)}" sẽ bị vô hiệu hóa (soft delete). Hành động này có thể khôi phục lại từ database nếu cần.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => deleteUser.mutate(user.id)}
                          >
                            Xóa
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