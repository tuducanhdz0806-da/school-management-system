import { IsEmail, IsIn, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
  password: string;

  @IsIn(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'], {
    message: 'Role phải là ADMIN, TEACHER, STUDENT hoặc PARENT',
  })
  role: string;

  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName: string;
}