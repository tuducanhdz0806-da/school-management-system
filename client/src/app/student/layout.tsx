'use client';

import { Sidebar, SidebarItem } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/lib/auth-context';
import { LayoutDashboard, CalendarDays, ClipboardList, QrCode, Bell } from 'lucide-react';

const studentMenu: SidebarItem[] = [
  { label: 'Tổng quan', href: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Thời khóa biểu', href: '/student/schedule', icon: CalendarDays },
  { label: 'Điểm số', href: '/student/scores', icon: ClipboardList },
  { label: 'Điểm danh QR', href: '/student/attendance', icon: QrCode },
  { label: 'Thông báo', href: '/student/notifications', icon: Bell },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  const title = user?.role === 'PARENT' ? 'Phụ huynh' : 'Học sinh';

  return (
    <div className="flex">
      <Sidebar items={studentMenu} title={title} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}