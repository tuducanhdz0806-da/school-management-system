import { IsInt } from 'class-validator';

export class AddStudentDto {
  @IsInt()
  studentId: number;
}