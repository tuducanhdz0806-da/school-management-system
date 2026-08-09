'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export function Sidebar({ items, title }: { items: SidebarItem[]; title: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r bg-white h-screen sticky top-0 flex flex-col">
      <div className="px-6 py-5 border-b">
        <h1 className="font-semibold text-lg">{title}</h1>
        <p className="text-xs text-gray-500 mt-0.5">School Management System</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}