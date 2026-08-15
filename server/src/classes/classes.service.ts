import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { AddStudentDto } from './dto/add-student.dto';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClassDto) {
    const existing = await this.prisma.class.findFirst({
      where: {
        name: dto.name,
        gradeLevel: dto.gradeLevel,
        academicYearId: dto.academicYearId,
      },
    });
    if (existing) {
      throw new ConflictException(
        `Lớp ${dto.gradeLevel}${dto.name} đã tồn tại trong năm học này`,
      );
    }

    return this.prisma.class.create({
      data: dto,
      include: { academicYear: true, homeroomTeacher: true },
    });
  }

  findAll(gradeLevel?: number) {
    return this.prisma.class.findMany({
      where: gradeLevel ? { gradeLevel } : undefined,
      include: {
        academicYear: true,
        homeroomTeacher: true,
        _count: { select: { classStudents: true } }, // đếm sĩ số tiện lợi
      },
      orderBy: [{ gradeLevel: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: number) {
    const cls = await this.prisma.class.findUnique({
      where: { id },
      include: {
        academicYear: true,
        homeroomTeacher: true,
        classStudents: { include: { student: true } },
      },
    });
    if (!cls) {
      throw new NotFoundException(`Không tìm thấy lớp id=${id}`);
    }
    return cls;
  }

  async update(id: number, dto: UpdateClassDto) {
    await this.findOne(id);
    return this.prisma.class.update({
      where: { id },
      data: dto,
      include: { academicYear: true, homeroomTeacher: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.class.delete({ where: { id } });
  }

  async addStudent(classId: number, dto: AddStudentDto) {
    await this.findOne(classId);

    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });
    if (!student) {
      throw new NotFoundException(`Không tìm thấy học sinh id=${dto.studentId}`);
    }

    const existing = await this.prisma.classStudent.findUnique({
      where: {
        classId_studentId: { classId, studentId: dto.studentId },
      },
    });
    if (existing) {
      throw new BadRequestException('Học sinh đã có trong lớp này rồi');
    }

    return this.prisma.classStudent.create({
      data: { classId, studentId: dto.studentId },
      include: { student: true },
    });
  }

  async removeStudent(classId: number, studentId: number) {
    const existing = await this.prisma.classStudent.findUnique({
      where: { classId_studentId: { classId, studentId } },
    });
    if (!existing) {
      throw new NotFoundException('Học sinh không có trong lớp này');
    }

    return this.prisma.classStudent.delete({
      where: { classId_studentId: { classId, studentId } },
    });
  }

  async findMyTeachingAssignments(teacherUserId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: teacherUserId },
    });
    if (!teacher) {
      return [];
    }

    return this.prisma.teachingAssignment.findMany({
      where: { teacherId: teacher.id },
      include: {
        class: { include: { academicYear: true } },
        subject: true,
      },
      orderBy: [{ class: { gradeLevel: 'asc' } }, { class: { name: 'asc' } }],
    });
  }

  async getMySchedule(studentUserId: number) {
    const student = await this.prisma.student.findUnique({
      where: { userId: studentUserId },
    });
    if (!student) {
      return [];
    }

    const classStudent = await this.prisma.classStudent.findFirst({
      where: { studentId: student.id },
    });
    if (!classStudent) {
      return [];
    }

    return this.prisma.schedule.findMany({
      where: { classId: classStudent.classId },
      include: {
        subject: true,
        teacher: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }],
    });
  }
}