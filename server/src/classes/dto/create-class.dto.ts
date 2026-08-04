import { IsInt, IsNotEmpty, IsOptional, Min, Max } from 'class-validator';

export class CreateClassDto {
  @IsNotEmpty({ message: 'Tên lớp không được để trống' })
  name: string; // vd: "A1"

  @IsInt()
  @Min(10)
  @Max(12)
  gradeLevel: number;

  @IsInt()
  academicYearId: number;

  @IsOptional()
  @IsInt()
  homeroomTeacherId?: number;
}