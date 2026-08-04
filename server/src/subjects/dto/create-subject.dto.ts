import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateSubjectDto {
  @IsNotEmpty({ message: 'Tên môn học không được để trống' })
  name: string;

  @IsInt()
  @Min(1)
  credit: number;
}