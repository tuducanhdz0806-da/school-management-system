import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import { ScoresService } from './scores.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('scores')
export class ScoresController {
  constructor(
    private readonly service: ScoresService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Auth('TEACHER')
  create(@Body() dto: CreateScoreDto, @Req() req: any) {
    return this.service.create(dto, req.user.userId);
  }

  @Patch(':id')
  @Auth('TEACHER')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateScoreDto,
    @Req() req: any,
  ) {
    return this.service.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @Auth('TEACHER', 'ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Get('student/:studentId')
  @Auth('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  async findByStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('semester') semester: string,
    @Req() req: any,
  ) {
    await this.checkOwnership(studentId, req.user);
    return this.service.findByStudent(studentId, semester ? parseInt(semester) : undefined);
  }

  @Get('student/:studentId/average')
  @Auth('ADMIN', 'TEACHER', 'STUDENT', 'PARENT')
  async getAverage(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('semester') semester: string,
    @Req() req: any,
  ) {
    await this.checkOwnership(studentId, req.user);
    return this.service.calculateAverage(studentId, semester ? parseInt(semester) : 1);
  }

  @Get('class/:classId/subject/:subjectId')
  @Auth('TEACHER', 'ADMIN')
  findByClassAndSubject(
    @Param('classId', ParseIntPipe) classId: number,
    @Param('subjectId', ParseIntPipe) subjectId: number,
    @Query('semester') semester: string,
  ) {
    return this.service.findByClassAndSubject(
      classId,
      subjectId,
      semester ? parseInt(semester) : 1,
    );
  }

  // Hàm helper kiểm tra quyền sở hữu — dùng chung cho 2 route xem điểm
  private async checkOwnership(studentId: number, user: any) {
    // ADMIN và TEACHER được xem điểm của bất kỳ ai
    if (user.role === 'ADMIN' || user.role === 'TEACHER') {
      return;
    }

    if (user.role === 'STUDENT') {
      const student = await this.prisma.student.findUnique({
        where: { userId: user.userId },
      });
      if (!student || student.id !== studentId) {
        throw new ForbiddenException('Bạn chỉ được xem điểm của chính mình');
      }
      return;
    }

    if (user.role === 'PARENT') {
      const student = await this.prisma.student.findFirst({
        where: { id: studentId, parentId: user.userId },
      });
      if (!student) {
        throw new ForbiddenException('Bạn chỉ được xem điểm của con mình');
      }
      return;
    }

    throw new ForbiddenException('Không có quyền truy cập');
  }
}