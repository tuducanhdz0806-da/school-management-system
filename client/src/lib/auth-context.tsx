'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { apiClient } from './api-client';
import type { User } from './types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  async function fetchCurrentUser() {
    try {
      // Decode payload từ JWT để lấy userId (không cần gọi API riêng)
      const token = Cookies.get('accessToken')!;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const res = await apiClient.get(`/users/${payload.sub}`);
      setUser(res.data);
    } catch {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const res = await apiClient.post('/auth/login', { email, password });
    const { accessToken, refreshToken } = res.data;

    Cookies.set('accessToken', accessToken, { expires: 1 / 24 });
    Cookies.set('refreshToken', refreshToken, { expires: 7 });

    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const userRes = await apiClient.get(`/users/${payload.sub}`);
    setUser(userRes.data);

    // Điều hướng theo role
    const roleRoutes: Record<string, string> = {
      ADMIN: '/admin/dashboard',
      TEACHER: '/teacher/dashboard',
      STUDENT: '/student/dashboard',
      PARENT: '/student/dashboard',
    };
    router.push(roleRoutes[payload.role] || '/');
  }

  async function logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore lỗi, vẫn logout ở client dù API lỗi
    }
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    setUser(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải dùng trong AuthProvider');
  }
  return context;
}