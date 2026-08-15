import { IsIn, IsInt, IsNumber, Max, Min } from 'class-validator';

export class CreateScoreDto {
  @IsInt()
  studentId: number;

  @IsInt()
  subjectId: number;

  @IsIn(['ORAL', 'QUIZ_15', 'TEST_45', 'FINAL'])
  scoreType: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  value: number;

  @IsInt()
  semester: number;
}