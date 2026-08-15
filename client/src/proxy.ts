import { NextRequest, NextResponse } from 'next/server';

// Decode JWT payload không cần verify chữ ký (chỉ đọc thông tin để routing UI,
// verify thật vẫn nằm ở Backend cho mọi API call)
function decodeToken(token: string): { sub: number; role: string } | null {
  try {
    const payload = token.split('.')[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

const roleRoutePrefix: Record<string, string> = {
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
  PARENT: '/student', // Parent dùng chung layout với Student
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;

  const isProtectedRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/student');

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = decodeToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const allowedPrefix = roleRoutePrefix[payload.role];
  if (!allowedPrefix || !pathname.startsWith(allowedPrefix)) {
    // Đăng nhập rồi nhưng vào nhầm khu vực role khác → đá về đúng khu vực của mình
    return NextResponse.redirect(new URL(`${allowedPrefix || '/login'}/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*', '/student/:path*'],
};