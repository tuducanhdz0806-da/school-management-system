'use client';

import { useNotifications } from '@/hooks/use-notifications';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Thông báo</h1>
      <p className="text-gray-500 mb-6">Các thông báo từ nhà trường</p>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (notifications || []).length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
          Chưa có thông báo nào
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n: any) => (
            <div key={n.id} className="rounded-lg border bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-50 p-2 shrink-0">
                  <Bell className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">{n.title}</h3>
                    <span className="text-xs text-gray-400">
                      {new Date(n.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{n.content}</p>
                  {n.targetRole && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      Dành cho: {n.targetRole}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}