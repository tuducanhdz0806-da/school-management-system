import { IsNotEmpty } from 'class-validator';

export class CheckInDto {
  @IsNotEmpty({ message: 'Token không được để trống' })
  token: string;
}