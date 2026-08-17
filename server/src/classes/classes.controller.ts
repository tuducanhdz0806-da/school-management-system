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
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { AddStudentDto } from './dto/add-student.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('classes')
@Auth('ADMIN')
export class ClassesController {
  constructor(
    private readonly service: ClassesService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  create(@Body() dto: CreateClassDto) {
    return this.service.create(dto);
  }

  @Get()
  @Auth('ADMIN', 'TEACHER')
  findAll(@Query('gradeLevel') gradeLevel?: string) {
    return this.service.findAll(gradeLevel ? parseInt(gradeLevel) : undefined);
  }

  @Get('my-assignments')
  @Auth('TEACHER')
  getMyAssignments(@Req() req: any) {
    return this.service.findMyTeachingAssignments(req.user.userId);
  }

  @Get('schedule/:studentId')
  @Auth('STUDENT', 'PARENT')
  async getSchedule(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Req() req: any,
  ) {
    await this.checkStudentOwnership(studentId, req.user);
    return this.service.getScheduleByStudentId(studentId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClassDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post(':id/students')
  addStudent(@Param('id', ParseIntPipe) id: number, @Body() dto: AddStudentDto) {
    return this.service.addStudent(id, dto);
  }

  @Delete(':id/students/:studentId')
  removeStudent(
    @Param('id', ParseIntPipe) id: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.service.removeStudent(id, studentId);
  }

  private async checkStudentOwnership(studentId: number, user: any) {
    if (user.role === 'ADMIN' || user.role === 'TEACHER') {
      return;
    }

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