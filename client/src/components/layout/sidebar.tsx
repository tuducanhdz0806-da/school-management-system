'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: SidebarItem[];
  title: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  items,
  title,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  const content = (
    <>
      <div
        className={cn(
          'px-6 py-5 border-b flex items-center justify-between',
          collapsed && 'px-3 justify-center',
        )}
      >
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="font-semibold text-lg truncate">{title}</h1>
            <p className="text-xs text-gray-500 mt-0.5 truncate">School Management System</p>
          </div>
        )}
        {/* Nút đóng riêng cho mobile drawer */}
        <button
          onClick={onCloseMobile}
          className="md:hidden rounded-md p-1.5 hover:bg-gray-100 shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-2',
                isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Nút toggle collapse - chỉ hiện trên desktop */}
      <button
        onClick={onToggleCollapse}
        className="hidden md:flex items-center justify-center border-t py-3 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r bg-white h-screen sticky top-0 transition-all duration-200 shrink-0',
          collapsed ? 'w-[68px]' : 'w-64',
        )}
      >
        {content}
      </aside>

      {/* Mobile overlay + drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={onCloseMobile} />
          <aside className="relative flex flex-col w-64 bg-white h-screen z-10 animate-in slide-in-from-left duration-200">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}