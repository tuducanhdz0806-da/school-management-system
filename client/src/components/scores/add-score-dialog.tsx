'use client';

import { useState } from 'react';
import { useCreateScore } from '@/hooks/use-scores';
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
import { SCORE_TYPE_OPTIONS } from '@/lib/constants';
import { Plus } from 'lucide-react';

export function AddScoreDialog({
  studentId,
  studentName,
  subjectId,
  semester,
}: {
  studentId: number;
  studentName: string;
  subjectId: number;
  semester: number;
}) {
  const [open, setOpen] = useState(false);
  const [scoreType, setScoreType] = useState('ORAL');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const createScore = useCreateScore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 10) {
      setError('Điểm phải từ 0 đến 10');
      return;
    }

    try {
      await createScore.mutateAsync({
        studentId,
        subjectId,
        scoreType,
        value: numValue,
        semester,
      });
      setOpen(false);
      setValue('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Nhập điểm thất bại');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-gray-50">
        <Plus className="h-3 w-3" />
        Thêm điểm
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nhập điểm cho {studentName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Loại điểm</Label>
            <Select value={scoreType} onValueChange={(v) => setScoreType(v ?? 'ORAL')}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {SCORE_TYPE_OPTIONS.find((o) => o.value === scoreType)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SCORE_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Điểm số (0 - 10)</Label>
            <Input
              type="number"
              step="0.1"
              min={0}
              max={10}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={createScore.isPending}>
              {createScore.isPending ? 'Đang lưu...' : 'Lưu điểm'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}