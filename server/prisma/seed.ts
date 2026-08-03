import { PrismaMssql } from '@prisma/adapter-mssql';
import { PrismaClient } from '../generated/prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const adapter = new PrismaMssql(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu...');

  // Xóa dữ liệu cũ theo đúng thứ tự (tránh lỗi khóa ngoại)
  await prisma.attendance.deleteMany();
  await prisma.score.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.teachingAssignment.deleteMany();
  await prisma.classStudent.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();
  console.log('🗑️  Đã xóa dữ liệu cũ');

  // Hash password mẫu dùng chung cho tất cả tài khoản test
  const defaultPassword = await bcrypt.hash('Password@123', 10);

  // ============================================
  // 1. Tạo Admin
  // ============================================
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@school.edu.vn',
      passwordHash: defaultPassword,
      role: 'ADMIN',
      admin: {
        create: { fullName: 'Nguyễn Văn Quản Trị' },
      },
    },
  });
  console.log(`✅ Tạo Admin: ${adminUser.email}`);

  // ============================================
  // 2. Tạo Academic Year
  // ============================================
  const academicYear = await prisma.academicYear.create({
    data: {
      name: '2025-2026',
      startDate: new Date('2025-09-05'),
      endDate: new Date('2026-05-31'),
    },
  });
  console.log(`✅ Tạo năm học: ${academicYear.name}`);

  // ============================================
  // 3. Tạo Subjects (môn học)
  // ============================================
  const subjectNames = ['Toán', 'Ngữ Văn', 'Tiếng Anh', 'Vật Lý', 'Hóa Học', 'Sinh Học'];
  const subjects = await Promise.all(
    subjectNames.map((name) =>
      prisma.subject.create({ data: { name, credit: 1 } }),
    ),
  );
  console.log(`✅ Tạo ${subjects.length} môn học`);

  // ============================================
  // 4. Tạo Teachers (5 giáo viên)
  // ============================================
  const teachers: any[] = [];
  for (let i = 0; i < 5; i++) {
    const fullName = faker.person.fullName();
    const user = await prisma.user.create({
      data: {
        email: `teacher${i + 1}@school.edu.vn`,
        passwordHash: defaultPassword,
        role: 'TEACHER',
        teacher: {
          create: {
            fullName,
            phone: faker.phone.number(),
          },
        },
      },
      include: { teacher: true },
    });
    teachers.push(user.teacher!);
  }
  console.log(`✅ Tạo ${teachers.length} giáo viên`);

  // ============================================
  // 5. Tạo Class (2 lớp), gán giáo viên chủ nhiệm
  // ============================================
  const classA = await prisma.class.create({
    data: {
      name: '10A1',
      academicYearId: academicYear.id,
      homeroomTeacherId: teachers[0].id,
    },
  });
  const classB = await prisma.class.create({
    data: {
      name: '10A2',
      academicYearId: academicYear.id,
      homeroomTeacherId: teachers[1].id,
    },
  });
  console.log(`✅ Tạo 2 lớp: ${classA.name}, ${classB.name}`);

  // ============================================
  // 6. Tạo Students (20 học sinh, chia đều 2 lớp) + Parent
  // ============================================
  const classes = [classA, classB];
  const students: any[] = [];

  for (let i = 0; i < 20; i++) {
    const fullName = faker.person.fullName();

    // Tạo tài khoản Parent trước
    const parentUser = await prisma.user.create({
      data: {
        email: `parent${i + 1}@gmail.com`,
        passwordHash: defaultPassword,
        role: 'PARENT',
      },
    });

    // Tạo tài khoản Student, gắn parentId
    const studentUser = await prisma.user.create({
      data: {
        email: `student${i + 1}@school.edu.vn`,
        passwordHash: defaultPassword,
        role: 'STUDENT',
        student: {
          create: {
            fullName,
            dateOfBirth: faker.date.birthdate({ min: 15, max: 17, mode: 'age' }),
            parentId: parentUser.id,
          },
        },
      },
      include: { student: true },
    });

    students.push(studentUser.student!);

    // Gán học sinh vào lớp (chia đều)
    const targetClass = classes[i % 2];
    await prisma.classStudent.create({
      data: {
        classId: targetClass.id,
        studentId: studentUser.student!.id,
      },
    });
  }
  console.log(`✅ Tạo ${students.length} học sinh (kèm phụ huynh) và gán vào lớp`);

  // ============================================
  // 7. Tạo Teaching Assignment (giáo viên dạy môn gì ở lớp nào)
  // ============================================
  let assignmentCount = 0;
  for (const cls of classes) {
    for (let i = 0; i < 3; i++) {
      await prisma.teachingAssignment.create({
        data: {
          teacherId: teachers[i].id,
          subjectId: subjects[i].id,
          classId: cls.id,
        },
      });
      assignmentCount++;
    }
  }
  console.log(`✅ Tạo ${assignmentCount} phân công giảng dạy`);

  // ============================================
  // 8. Tạo Schedule (thời khóa biểu mẫu)
  // ============================================
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY'];
  let scheduleCount = 0;
  const schedules: any[] = [];

  for (const cls of classes) {
    for (let i = 0; i < 3; i++) {
      const schedule = await prisma.schedule.create({
        data: {
          classId: cls.id,
          subjectId: subjects[i].id,
          teacherId: teachers[i].id,
          dayOfWeek: days[i],
          period: i + 1,
          room: `P.${100 + i}`,
        },
      });
      schedules.push(schedule);
      scheduleCount++;
    }
  }
  console.log(`✅ Tạo ${scheduleCount} tiết học trong thời khóa biểu`);

  // ============================================
  // 9. Tạo Attendance mẫu (điểm danh vài buổi gần đây)
  // ============================================
  let attendanceCount = 0;
  const statuses = ['PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LATE']; // ưu tiên PRESENT nhiều hơn

  for (const student of students.slice(0, 10)) {
    for (const schedule of schedules.slice(0, 2)) {
      await prisma.attendance.create({
        data: {
          studentId: student.id,
          scheduleId: schedule.id,
          date: new Date(),
          status: statuses[Math.floor(Math.random() * statuses.length)],
          checkedByQr: Math.random() > 0.5,
        },
      });
      attendanceCount++;
    }
  }
  console.log(`✅ Tạo ${attendanceCount} bản ghi điểm danh mẫu`);

  // ============================================
  // 10. Tạo Score mẫu (điểm số)
  // ============================================
  const scoreTypes = [
    { type: 'ORAL', weight: 1 },
    { type: 'QUIZ_15', weight: 1 },
    { type: 'TEST_45', weight: 2 },
    { type: 'FINAL', weight: 3 },
  ];
  let scoreCount = 0;

  for (const student of students) {
    for (const subject of subjects.slice(0, 3)) {
      for (const st of scoreTypes) {
        await prisma.score.create({
          data: {
            studentId: student.id,
            subjectId: subject.id,
            scoreType: st.type,
            value: parseFloat((Math.random() * 4 + 6).toFixed(1)), // điểm 6.0 - 10.0
            weight: st.weight,
            semester: 1,
          },
        });
        scoreCount++;
      }
    }
  }
  console.log(`✅ Tạo ${scoreCount} điểm số`);

  // ============================================
  // 11. Tạo Notification mẫu
  // ============================================
  await prisma.notification.create({
    data: {
      title: 'Thông báo nghỉ lễ',
      content: 'Nhà trường thông báo lịch nghỉ lễ Quốc Khánh 2/9.',
      targetRole: null, // gửi cho tất cả
    },
  });
  await prisma.notification.create({
    data: {
      title: 'Họp phụ huynh đầu năm',
      content: 'Kính mời quý phụ huynh tham dự buổi họp đầu năm học.',
      targetRole: 'PARENT',
    },
  });
  console.log('✅ Tạo thông báo mẫu');

  console.log('🎉 Seed dữ liệu hoàn tất!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });