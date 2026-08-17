import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';

// Trọng số cố định theo loại điểm — không cho client tự gửi lên
const SCORE_WEIGHTS: Record<string, number> = {
  ORAL: 1,
  QUIZ_15: 1,
  TEST_45: 2,
  FINAL: 3,
};

@Injectable()
export class ScoresService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyTeacherAssignment(
    teacherUserId: number,
    studentId: number,
    subjectId: number,
  ) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: teacherUserId },
    });
    if (!teacher) {
      throw new ForbiddenException('Chỉ giáo viên mới được nhập điểm');
    }

    // Tìm lớp mà học sinh này đang theo học
    const classStudent = await this.prisma.classStudent.findFirst({
      where: { studentId },
    });
    if (!classStudent) {
      throw new NotFoundException('Học sinh chưa thuộc lớp nào');
    }

    // Kiểm tra giáo viên có được phân công dạy đúng môn cho đúng lớp này không
    const assignment = await this.prisma.teachingAssignment.findFirst({
      where: {
        teacherId: teacher.id,
        subjectId,
        classId: classStudent.classId,
      },
    });
    if (!assignment) {
      throw new ForbiddenException(
        'Bạn không được phân công dạy môn này cho lớp của học sinh này',
      );
    }
  }

  async create(dto: CreateScoreDto, teacherUserId: number) {
    await this.verifyTeacherAssignment(teacherUserId, dto.studentId, dto.subjectId);

    return this.prisma.score.create({
      data: {
        studentId: dto.studentId,
        subjectId: dto.subjectId,
        scoreType: dto.scoreType,
        value: dto.value,
        weight: SCORE_WEIGHTS[dto.scoreType],
        semester: dto.semester,
      },
      include: { subject: true },
    });
  }

  async update(id: number, dto: UpdateScoreDto, teacherUserId: number) {
    const score = await this.prisma.score.findUnique({ where: { id } });
    if (!score) {
      throw new NotFoundException(`Không tìm thấy điểm id=${id}`);
    }

    await this.verifyTeacherAssignment(teacherUserId, score.studentId, score.subjectId);

    return this.prisma.score.update({
      where: { id },
      data: { value: dto.value },
      include: { subject: true },
    });
  }

  async remove(id: number) {
    const score = await this.prisma.score.findUnique({ where: { id } });
    if (!score) {
      throw new NotFoundException(`Không tìm thấy điểm id=${id}`);
    }
    return this.prisma.score.delete({ where: { id } });
  }

  async findByStudent(studentId: number, semester?: number) {
    return this.prisma.score.findMany({
      where: {
        studentId,
        ...(semester && { semester }),
      },
      include: { subject: true },
      orderBy: [{ subjectId: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async calculateAverage(studentId: number, semester: number) {
    const scores = await this.prisma.score.findMany({
      where: { studentId, semester },
      include: { subject: true },
    });

    // Nhóm điểm theo từng môn học
    const bySubject: Record<number, { subjectName: string; totalWeighted: number; totalWeight: number }> = {};

    for (const score of scores) {
      if (!bySubject[score.subjectId]) {
        bySubject[score.subjectId] = {
          subjectName: score.subject.name,
          totalWeighted: 0,
          totalWeight: 0,
        };
      }
      bySubject[score.subjectId].totalWeighted += score.value * score.weight;
      bySubject[score.subjectId].totalWeight += score.weight;
    }

    const subjectAverages = Object.entries(bySubject).map(([subjectId, data]) => ({
      subjectId: parseInt(subjectId),
      subjectName: data.subjectName,
      average: parseFloat((data.totalWeighted / data.totalWeight).toFixed(2)),
    }));

    const overallAverage =
      subjectAverages.length > 0
        ? parseFloat(
            (
              subjectAverages.reduce((sum, s) => sum + s.average, 0) /
              subjectAverages.length
            ).toFixed(2),
          )
        : 0;

    return { studentId, semester, subjectAverages, overallAverage };
  }

  async findByClassAndSubject(classId: number, subjectId: number, semester: number) {
    const classStudents = await this.prisma.classStudent.findMany({
      where: { classId },
      include: { student: true },
    });

    const result: any[] = [];
    for (const cs of classStudents) {
      const scores = await this.prisma.score.findMany({
        where: { studentId: cs.studentId, subjectId, semester },
      });
      result.push({
        studentId: cs.studentId,
        studentName: cs.student.fullName,
        scores,
      });
    }
    return result;
  }

  async getPendingTasks(teacherUserId: number, semester: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: teacherUserId },
    });
    if (!teacher) return [];

    const assignments = await this.prisma.teachingAssignment.findMany({
      where: { teacherId: teacher.id },
      include: { class: true, subject: true },
    });

    const tasks: any[] = [];
    for (const a of assignments) {
      const studentCount = await this.prisma.classStudent.count({
        where: { classId: a.classId },
      });
      const finalScoreCount = await this.prisma.score.count({
        where: {
          subjectId: a.subjectId,
          semester,
          scoreType: 'FINAL',
          student: { classStudents: { some: { classId: a.classId } } },
        },
      });

      if (studentCount > 0 && finalScoreCount < studentCount) {
        tasks.push({
          className: `${a.class.gradeLevel}${a.class.name}`,
          subjectName: a.subject.name,
          taskType: 'ENTER_SCORE',
          missingCount: studentCount - finalScoreCount,
          totalStudents: studentCount,
        });
      }
    }

    return tasks;
  }
}