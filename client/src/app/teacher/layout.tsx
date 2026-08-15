'use client';

import { Sidebar, SidebarItem } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/lib/auth-context';
import { LayoutDashboard, School, QrCode, ClipboardList } from 'lucide-react';

const teacherMenu: SidebarItem[] = [
  { label: 'Tổng quan', href: '/teacher/dashboard', icon: LayoutDashboard },
  { label: 'Lớp tôi dạy', href: '/teacher/classes', icon: School },
  { label: 'Điểm danh QR', href: '/teacher/attendance', icon: QrCode },
  { label: 'Nhập điểm', href: '/teacher/scores', icon: ClipboardList },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar items={teacherMenu} title="Giáo viên" />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}