export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface User {
  id: number;
  email: string;
  role: Role;
  createdAt: string;
  teacher?: { id: number; fullName: string; phone: string | null };
  student?: { id: number; fullName: string; dateOfBirth: string | null; parentId: number | null };
  admin?: { id: number; fullName: string };
  parent?: { id: number; fullName: string; phone: string | null };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AcademicYear {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}

export interface Subject {
  id: number;
  name: string;
  credit: number;
}

export interface Class {
  id: number;
  name: string;
  gradeLevel: number;
  academicYearId: number;
  homeroomTeacherId: number | null;
  academicYear?: AcademicYear;
  homeroomTeacher?: { id: number; fullName: string };
  _count?: { classStudents: number };
}