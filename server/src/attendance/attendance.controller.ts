import { Controller, Post, Get, Body, Param, Query, Req, ForbiddenException, ParseIntPipe } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CheckInDto } from './dto/check-in.dto';
import { ManualAttendanceDto } from './dto/manual-attendance.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly service: AttendanceService,
    private readonly prisma: PrismaService,
  ) {}

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

  @Get('my-schedules')
  @Auth('TEACHER')
  getMySchedules(@Req() req: any) {
    return this.service.getMySchedules(req.user.userId);
  }

  @Get('schedule/:scheduleId')
  @Auth('TEACHER', 'ADMIN')
  getBySchedule(@Param('scheduleId', ParseIntPipe) scheduleId: number) {
    return this.service.getBySchedule(scheduleId);
  }

  @Get('stats/:studentId')
  @Auth('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  async getStats(@Param('studentId', ParseIntPipe) studentId: number, @Req() req: any) {
    await this.checkOwnership(studentId, req.user);
    return this.service.getAttendanceStats(studentId);
  }

  @Get('class/:classId')
  @Auth('TEACHER', 'ADMIN')
  getByClass(@Param('classId') classId: string, @Query('date') date?: string) {
    return this.service.getByClass(parseInt(classId), date);
  }

  private async checkOwnership(studentId: number, user: any) {
    if (user.role === 'ADMIN' || user.role === 'TEACHER') return;

    if (user.role === 'STUDENT') {
      const student = await this.prisma.student.findUnique({
        where: { userId: user.userId },
      });
      if (!student || student.id !== studentId) {
        throw new ForbiddenException('Bạn chỉ được xem thông tin của chính mình');
      }
      return;
    }

    if (user.role === 'PARENT') {
      const parent = await this.prisma.parent.findUnique({
        where: { userId: user.userId },
      });
      const student = await this.prisma.student.findFirst({
        where: { id: studentId, parentId: parent?.id },
      });
      if (!student) {
        throw new ForbiddenException('Bạn chỉ được xem thông tin của con mình');
      }
      return;
    }

    throw new ForbiddenException('Không có quyền truy cập');
  }
}