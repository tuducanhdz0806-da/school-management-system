'use client';

import { useState } from 'react';
import { useAddStudentToClass } from '@/hooks/use-classes';
import { useUsers } from '@/hooks/use-users';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus } from 'lucide-react';

export function AddStudentDialog({
  classId,
  existingStudentIds,
}: {
  classId: number;
  existingStudentIds: number[];
}) {
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');

  const { data: allStudents } = useUsers('STUDENT');
  const addStudent = useAddStudentToClass(classId);

  const availableStudents = (allStudents || []).filter(
    (u: any) => !existingStudentIds.includes(u.student?.id),
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!studentId) {
      setError('Vui lòng chọn học sinh');
      return;
    }

    try {
      await addStudent.mutateAsync(parseInt(studentId));
      setOpen(false);
      setStudentId('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Thêm học sinh thất bại');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-2 rounded-md bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800">
        <UserPlus className="h-4 w-4" />
        Thêm học sinh
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm học sinh vào lớp</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select value={studentId} onValueChange={(value) => setStudentId(value ?? '')}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn học sinh" />
            </SelectTrigger>
            <SelectContent>
              {availableStudents.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  Không còn học sinh nào để thêm
                </div>
              )}
              {availableStudents.map((u: any) => (
                <SelectItem key={u.student.id} value={String(u.student.id)}>
                  {u.student.fullName} — {u.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={addStudent.isPending}>
              {addStudent.isPending ? 'Đang thêm...' : 'Thêm vào lớp'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}