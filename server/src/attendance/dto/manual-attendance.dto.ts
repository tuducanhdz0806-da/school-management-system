import { IsIn, IsInt } from 'class-validator';

export class ManualAttendanceDto {
  @IsInt()
  studentId: number;

  @IsInt()
  scheduleId: number;

  @IsIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'])
  status: string;
}