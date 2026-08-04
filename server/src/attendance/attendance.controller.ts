import { Controller, Post, Get, Body, Param, Query, Req } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CheckInDto } from './dto/check-in.dto';
import { ManualAttendanceDto } from './dto/manual-attendance.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Post('sessions')
  @Auth('TEACHER')
  createSession(@Body() dto: CreateSessionDto, @Req() req: any) {
    return this.service.createSession(dto, req.user.userId);
  }

  @Post('check-in')
  @Auth('STUDENT')
  checkIn(@Body() dto: CheckInDto, @Req() req: any) {
    return this.service.checkIn(dto, req.user.userId);
  }

  @Post('manual')
  @Auth('TEACHER', 'ADMIN') // cả TEACHER và ADMIN đều được điểm danh thủ công
  markManual(@Body() dto: ManualAttendanceDto) {
    return this.service.markManual(dto);
  }

  @Get('class/:classId')
  @Auth('TEACHER', 'ADMIN')
  getByClass(@Param('classId') classId: string, @Query('date') date?: string) {
    return this.service.getByClass(parseInt(classId), date);
  }
}