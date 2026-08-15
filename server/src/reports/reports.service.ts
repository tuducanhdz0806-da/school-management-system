import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument = require('pdfkit');
import * as path from 'path';

const SCORE_WEIGHTS: Record<string, number> = {
  ORAL: 1,
  QUIZ_15: 1,
  TEST_45: 2,
  FINAL: 3,
};

const SCORE_TYPE_LABELS: Record<string, string> = {
  ORAL: 'Miệng',
  QUIZ_15: '15 phút',
  TEST_45: '1 tiết',
  FINAL: 'Cuối kỳ',
};

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateStudentReport(studentId: number, semester: number): Promise<Buffer> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        classStudents: {
          include: { class: true },
        },
      },
    });
    if (!student) {
      throw new NotFoundException(`Không tìm thấy học sinh id=${studentId}`);
    }

    const scores = await this.prisma.score.findMany({
      where: { studentId, semester },
      include: { subject: true },
      orderBy: [{ subjectId: 'asc' }, { createdAt: 'asc' }],
    });

    // Nhóm điểm theo môn học
    const bySubject: Record<number, { subjectName: string; scores: typeof scores; totalWeighted: number; totalWeight: number }> = {};

    for (const score of scores) {
      if (!bySubject[score.subjectId]) {
        bySubject[score.subjectId] = {
          subjectName: score.subject.name,
          scores: [],
          totalWeighted: 0,
          totalWeight: 0,
        };
      }
      bySubject[score.subjectId].scores.push(score);
      bySubject[score.subjectId].totalWeighted += score.value * score.weight;
      bySubject[score.subjectId].totalWeight += score.weight;
    }

    const className = student.classStudents[0]?.class?.name ?? 'Chưa có lớp';
    const gradeLevel = student.classStudents[0]?.class?.gradeLevel ?? '';

    return this.buildPdf(student.fullName, `${gradeLevel}${className}`, semester, bySubject);
  }

  private buildPdf(
  studentName: string,
  className: string,
  semester: number,
  bySubject: Record<number, { subjectName: string; scores: any[]; totalWeighted: number; totalWeight: number }>,
  ): Promise<Buffer> {
      return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Đăng ký font tiếng Việt
      const fontRegular = path.join(process.cwd(), 'dist', 'reports', 'fonts', 'Roboto-Regular.ttf');
      const fontBold = path.join(process.cwd(), 'dist', 'reports', 'fonts', 'Roboto-Bold.ttf');
      doc.registerFont('Roboto', fontRegular);
      doc.registerFont('Roboto-Bold', fontBold);

      // ===== Header =====
      doc.font('Roboto-Bold').fontSize(18).text('TRƯỜNG THPT ABC', { align: 'center' });
      doc.font('Roboto-Bold').fontSize(14).text('PHIẾU ĐIỂM HỌC SINH', { align: 'center' });
      doc.moveDown(1);

      doc.font('Roboto').fontSize(11);
      doc.text(`Họ và tên: ${studentName}`);
      doc.text(`Lớp: ${className}`);
      doc.text(`Học kỳ: ${semester}`);
      doc.moveDown(1);

      // ===== Bảng điểm từng môn =====
      let overallSum = 0;
      let subjectCount = 0;

      for (const subjectId in bySubject) {
        const data = bySubject[subjectId];
        const average = data.totalWeight > 0 ? data.totalWeighted / data.totalWeight : 0;
        overallSum += average;
        subjectCount++;

        doc.font('Roboto-Bold').fontSize(12).text(data.subjectName);
        doc.font('Roboto').fontSize(10);

        for (const score of data.scores) {
          doc.text(
            `   - ${SCORE_TYPE_LABELS[score.scoreType]}: ${score.value} (hệ số ${score.weight})`,
          );
        }

        doc
          .font('Roboto-Bold')
          .fontSize(10)
          .text(`   → Điểm trung bình môn: ${average.toFixed(2)}`);
        doc.moveDown(0.5);
      }

      // ===== Điểm trung bình chung =====
      const overallAverage = subjectCount > 0 ? overallSum / subjectCount : 0;
      doc.moveDown(1);
      doc
        .font('Roboto-Bold')
        .fontSize(13)
        .text(`ĐIỂM TRUNG BÌNH CHUNG: ${overallAverage.toFixed(2)}`, { align: 'center' });

      // ===== Footer =====
      doc.moveDown(2);
      doc.font('Roboto').fontSize(10).text(
        `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`,
        { align: 'right' },
      );

      doc.end();
    });
  }
}