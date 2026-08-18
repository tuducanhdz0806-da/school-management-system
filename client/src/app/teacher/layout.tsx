'use client';

import { useState } from 'react';
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar
        items={teacherMenu}
        title="Giáo viên"
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}