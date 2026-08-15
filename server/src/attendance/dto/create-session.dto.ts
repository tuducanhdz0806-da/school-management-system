import { IsInt } from 'class-validator';

export class CreateSessionDto {
  @IsInt()
  scheduleId: number;
}