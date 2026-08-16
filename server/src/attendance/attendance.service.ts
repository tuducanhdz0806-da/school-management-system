import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CheckInDto } from './dto/check-in.dto';
import { ManualAttendanceDto } from './dto/manual-attendance.dto';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(dto: CreateSessionDto, teacherUserId: number) {
    // Xác nhận schedule tồn tại và đúng là giáo viên này phụ trách
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: dto.scheduleId },
      include: { teacher: true },
    });
    if (!schedule) {
      throw new NotFoundException(`Không tìm thấy tiết học id=${dto.scheduleId}`);
    }
    if (schedule.teacher.userId !== teacherUserId) {
      throw new ForbiddenException('Bạn không phụ trách tiết học này');
    }

    // Sinh token ngẫu nhiên, an toàn (32 bytes hex)
    const token = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // +5 phút

    const session = await this.prisma.attendanceSession.create({
      data: {
        scheduleId: dto.scheduleId,
        token,
        date: now,
        expiresAt,
      },
    });

    // Sinh ảnh QR dạng base64 (data URL), nhúng token vào
    const qrImage = await QRCode.toDataURL(token);

    return {
      sessionId: session.id,
      token: session.token,
      expiresAt: session.expiresAt,
      qrImage, // frontend hiển thị trực tiếp qua thẻ <img src="...">
    };
  }

  async checkIn(dto: CheckInDto, studentUserId: number) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { token: dto.token },
      include: { schedule: true },
    });

    if (!session) {
      throw new NotFoundException('Mã QR không hợp lệ');
    }
    if (new Date() > session.expiresAt) {
      throw new BadRequestException('Mã QR đã hết hạn, vui lòng xin mã mới');
    }

    // Xác nhận user gọi API này đúng là Student, lấy student.id tương ứng
    const student = await this.prisma.student.findUnique({
      where: { userId: studentUserId },
    });
    if (!student) {
      throw new ForbiddenException('Chỉ học sinh mới được điểm danh');
    }

    // Kiểm tra học sinh này có thuộc lớp của tiết học này không
    const classStudent = await this.prisma.classStudent.findUnique({
      where: {
        classId_studentId: {
          classId: session.schedule.classId,
          studentId: student.id,
        },
      },
    });
    if (!classStudent) {
      throw new ForbiddenException('Bạn không thuộc lớp học này');
    }

    // Kiểm tra đã điểm danh buổi này chưa (tránh quét 2 lần)
    const existing = await this.prisma.attendance.findUnique({
      where: {
        studentId_scheduleId_date: {
          studentId: student.id,
          scheduleId: session.scheduleId,
          date: session.date,
        },
      },
    });
    if (existing) {
      throw new BadRequestException('Bạn đã điểm danh buổi này rồi');
    }

    return this.prisma.attendance.create({
      data: {
        studentId: student.id,
        scheduleId: session.scheduleId,
        date: session.date,
        status: 'PRESENT',
        checkedByQr: true,
      },
    });
  }

  async markManual(dto: ManualAttendanceDto) {
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));


    const existing = await this.prisma.attendance.findUnique({
      where: {
        studentId_scheduleId_date: {
          studentId: dto.studentId,
          scheduleId: dto.scheduleId,
          date: today,
        },
      },
    });

    if (existing) {
      return this.prisma.attendance.update({
        where: { id: existing.id },
        data: { status: dto.status, checkedByQr: false },
      });
    }

    return this.prisma.attendance.create({
      data: {
        studentId: dto.studentId,
        scheduleId: dto.scheduleId,
        date: today,
        status: dto.status,
        checkedByQr: false,
      },
    });
  }

  async getByClass(classId: number, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    return this.prisma.attendance.findMany({
      where: {
        date: targetDate,
        schedule: { classId },
      },
      include: {
        student: true,
        schedule: { include: { subject: true } },
      },
      orderBy: { studentId: 'asc' },
    });
  }

  async getMySchedules(teacherUserId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: teacherUserId },
    });
    if (!teacher) {
      return [];
    }

    return this.prisma.schedule.findMany({
      where: { teacherId: teacher.id },
      include: {
        class: true,
        subject: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }],
    });
  }

  async getBySchedule(scheduleId: number) {
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    return this.prisma.attendance.findMany({
      where: {
        scheduleId,
        date: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
      include: { student: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAttendanceStats(studentId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      return { presentCount: 0, totalSessions: 0, attendanceRate: 0 };
    }

    const records = await this.prisma.attendance.findMany({
      where: { studentId },
    });

    const presentCount = records.filter(
      (r) => r.status === 'PRESENT' || r.status === 'LATE',
    ).length;
    const totalSessions = records.length;
    const attendanceRate =
      totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    return { presentCount, totalSessions, attendanceRate };
  }
}