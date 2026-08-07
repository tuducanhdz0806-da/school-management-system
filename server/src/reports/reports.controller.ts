import { Controller, Get, Param, Query, Res, Req, ForbiddenException, ParseIntPipe } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly service: ReportsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('student/:studentId')
  @Auth('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  async getStudentReport(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('semester') semester: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    await this.checkOwnership(studentId, req.user);

    const pdfBuffer = await this.service.generateStudentReport(
      studentId,
      semester ? parseInt(semester) : 1,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=phieu-diem-${studentId}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  private async checkOwnership(studentId: number, user: any) {
    if (user.role === 'ADMIN' || user.role === 'TEACHER') return;

    if (user.role === 'STUDENT') {
      const student = await this.prisma.student.findUnique({ where: { userId: user.userId } });
      if (!student || student.id !== studentId) {
        throw new ForbiddenException('Bạn chỉ được xem phiếu điểm của chính mình');
      }
      return;
    }

    if (user.role === 'PARENT') {
      const student = await this.prisma.student.findFirst({
        where: { id: studentId, parentId: user.userId },
      });
      if (!student) {
        throw new ForbiddenException('Bạn chỉ được xem phiếu điểm của con mình');
      }
      return;
    }

    throw new ForbiddenException('Không có quyền truy cập');
  }
}