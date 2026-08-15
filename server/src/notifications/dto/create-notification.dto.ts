import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  title: string;

  @IsNotEmpty({ message: 'Nội dung không được để trống' })
  content: string;

  @IsOptional()
  @IsIn(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'])
  targetRole?: string; // để trống = gửi cho tất cả
}