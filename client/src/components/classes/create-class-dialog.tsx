'use client';

import { useState } from 'react';
import { useCreateClass } from '@/hooks/use-classes';
import { useAcademicYears } from '@/hooks/use-academic-years';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

export function CreateClassDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('10');
  const [academicYearId, setAcademicYearId] = useState('');
  const [homeroomTeacherId, setHomeroomTeacherId] = useState('');
  const [error, setError] = useState('');

  const { data: academicYears } = useAcademicYears();
  const { data: teachers } = useUsers('TEACHER');
  const createClass = useCreateClass();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!academicYearId) {
      setError('Vui lòng chọn năm học');
      return;
    }

    try {
      await createClass.mutateAsync({
        name,
        gradeLevel: parseInt(gradeLevel),
        academicYearId: parseInt(academicYearId),
        homeroomTeacherId: homeroomTeacherId ? parseInt(homeroomTeacherId) : undefined,
      });
      setOpen(false);
      setName('');
      setHomeroomTeacherId('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Tạo lớp thất bại');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-2 rounded-md bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800">
        <Plus className="h-4 w-4" />
        Thêm lớp mới
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo lớp mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tên lớp (vd: A1)</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Khối</Label>
              <Select value={gradeLevel} onValueChange={(value) => setGradeLevel(value ?? '')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">Khối 10</SelectItem>
                  <SelectItem value="11">Khối 11</SelectItem>
                  <SelectItem value="12">Khối 12</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Năm học</Label>
            <Select value={academicYearId} onValueChange={(value) => setAcademicYearId(value ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn năm học">
                    {(academicYears || []).find((y) => String(y.id) === academicYearId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {academicYears?.map((y) => (
                  <SelectItem key={y.id} value={String(y.id)}>
                    {y.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Giáo viên chủ nhiệm (tùy chọn)</Label>
            <Select value={homeroomTeacherId} onValueChange={(value) => setHomeroomTeacherId(value ?? '')}>
                <SelectTrigger>
                    <SelectValue placeholder="Chọn giáo viên">
                        {(teachers || []).find((t: any) => String(t.teacher?.id) === homeroomTeacherId)?.teacher?.fullName}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {teachers?.map((t: any) => (
                    <SelectItem key={t.teacher.id} value={String(t.teacher.id)}>
                        {t.teacher.fullName}
                    </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={createClass.isPending}>
              {createClass.isPending ? 'Đang tạo...' : 'Tạo lớp'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}