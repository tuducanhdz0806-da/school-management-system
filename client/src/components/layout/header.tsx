'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, KeyRound, Menu } from 'lucide-react';

function canChangePassword(role: string | undefined): boolean {
  return role === 'TEACHER' || role === 'STUDENT' || role === 'PARENT';
}

export function Header({ onOpenMobileMenu }: { onOpenMobileMenu?: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const displayName =
    user?.admin?.fullName || user?.teacher?.fullName || user?.student?.fullName || user?.parent?.fullName || user?.email;

  const initials = displayName
    ?.split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  const showChangePassword = canChangePassword(user?.role);

  function handleChangePassword() {
    router.push('/change-password');
  }

  async function handleLogout() {
    await logout();
  }

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      <button
        onClick={onOpenMobileMenu}
        className="md:hidden rounded-md p-2 hover:bg-gray-100"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden md:block" />

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-100 transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-sm font-medium">{displayName}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-gray-400 font-normal">
              {user?.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {showChangePassword && (
              <DropdownMenuItem onClick={handleChangePassword} className="cursor-pointer transition-colors">
                <KeyRound className="mr-2 h-4 w-4" />
                Thay đổi mật khẩu
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 transition-colors">
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}