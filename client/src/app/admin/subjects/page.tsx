'use client';

import { useState } from 'react';
import { useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject } from '@/hooks/use-subjects';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function SubjectsPage() {
  const { data: subjects, isLoading } = useSubjects();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [credit, setCredit] = useState('1');
  const [error, setError] = useState('');

  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editCredit, setEditCredit] = useState('1');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await createSubject.mutateAsync({ name, credit: parseInt(credit) });
      setCreateOpen(false);
      setName('');
      setCredit('1');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Tạo môn học thất bại');
    }
  }

  function openEdit(subject: any) {
    setEditId(subject.id);
    setEditName(subject.name);
    setEditCredit(String(subject.credit));
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    await updateSubject.mutateAsync({
      id: editId,
      data: { name: editName, credit: parseInt(editCredit) },
    });
    setEditId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Môn học</h1>
          <p className="text-gray-500">Quản lý danh mục môn học</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger className="inline-flex items-center gap-2 rounded-md bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800">
            <Plus className="h-4 w-4" />
            Thêm môn học
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm môn học mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Tên môn học</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Số tín chỉ</Label>
                <Input
                  type="number"
                  min={1}
                  value={credit}
                  onChange={(e) => setCredit(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <DialogFooter>
                <Button type="submit" disabled={createSubject.isPending}>
                  {createSubject.isPending ? 'Đang tạo...' : 'Tạo môn học'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên môn học</TableHead>
              <TableHead>Số tín chỉ</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={3}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading &&
              subjects?.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">
                    {editId === subject.id ? (
                      <form onSubmit={handleUpdate} className="flex gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8"
                        />
                      </form>
                    ) : (
                      subject.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editId === subject.id ? (
                      <Input
                        type="number"
                        min={1}
                        value={editCredit}
                        onChange={(e) => setEditCredit(e.target.value)}
                        className="h-8 w-20"
                      />
                    ) : (
                      subject.credit
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {editId === subject.id ? (
                      <>
                        <Button size="sm" onClick={handleUpdate} disabled={updateSubject.isPending}>
                          Lưu
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>
                          Hủy
                        </Button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => openEdit(subject)}
                          className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-gray-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-red-50 text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xóa môn học?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Môn "{subject.name}" sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => deleteSubject.mutate(subject.id)}
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}