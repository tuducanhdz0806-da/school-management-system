'use client';

import { useMyTeachingAssignments } from '@/hooks/use-teaching-assignments';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function TeacherClassesPage() {
  const { data: assignments, isLoading } = useMyTeachingAssignments();

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  // Nhóm assignment theo lớp
  const byClass: Record<number, { class: any; subjects: any[] }> = {};
  (assignments || []).forEach((a: any) => {
    if (!byClass[a.classId]) {
      byClass[a.classId] = { class: a.class, subjects: [] };
    }
    byClass[a.classId].subjects.push(a.subject);
  });

  const classGroups = Object.values(byClass);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Lớp tôi dạy</h1>
      <p className="text-gray-500 mb-6">Danh sách các lớp và môn học được phân công</p>

      {classGroups.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
          Chưa được phân công lớp nào
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {classGroups.map(({ class: cls, subjects }) => (
            <div key={cls.id} className="rounded-lg border bg-white p-5">
              <h3 className="font-semibold text-lg">
                Lớp {cls.gradeLevel}{cls.name}
              </h3>
              <p className="text-sm text-gray-500 mb-3">{cls.academicYear?.name}</p>
              <div className="flex flex-wrap gap-1.5">
                {subjects.map((s: any) => (
                  <Badge key={s.id} variant="secondary">
                    {s.name}
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