import { IsIn, IsOptional } from 'class-validator';

export class QueryUserDto {
  @IsOptional()
  @IsIn(['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'])
  role?: string;
}