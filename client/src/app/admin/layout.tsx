'use client';

import { useState } from 'react';
import { Sidebar, SidebarItem } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Users,
  School,
  BookOpen,
  CalendarDays,
} from 'lucide-react';

const adminMenu: SidebarItem[] = [
  { label: 'Tổng quan', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Người dùng', href: '/admin/users', icon: Users },
  { label: 'Lớp học', href: '/admin/classes', icon: School },
  { label: 'Môn học', href: '/admin/subjects', icon: BookOpen },
  { label: 'Năm học', href: '/admin/academic-years', icon: CalendarDays },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
        items={adminMenu}
        title="Admin"
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