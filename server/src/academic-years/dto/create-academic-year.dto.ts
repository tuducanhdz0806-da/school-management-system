import { IsDateString, IsNotEmpty } from 'class-validator';

export class CreateAcademicYearDto {
  @IsNotEmpty({ message: 'Tên năm học không được để trống' })
  name: string; // vd: "2025-2026"

  @IsDateString({}, { message: 'startDate phải đúng định dạng ngày (YYYY-MM-DD)' })
  startDate: string;

  @IsDateString({}, { message: 'endDate phải đúng định dạng ngày (YYYY-MM-DD)' })
  endDate: string;
}