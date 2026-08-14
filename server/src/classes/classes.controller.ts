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
  ParseIntPipe,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { AddStudentDto } from './dto/add-student.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('classes')
@Auth('ADMIN')
export class ClassesController {
  constructor(private readonly service: ClassesService) {}

  @Post()
  create(@Body() dto: CreateClassDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('gradeLevel') gradeLevel?: string) {
    return this.service.findAll(gradeLevel ? parseInt(gradeLevel) : undefined);
  }

  @Get('my-assignments')
  @Auth('TEACHER')
  getMyAssignments(@Req() req: any) {
    return this.service.findMyTeachingAssignments(req.user.userId);
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
}