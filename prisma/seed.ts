import { PrismaClient, Role, UserSex, Day, ExamType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  const hashedPassword = await bcrypt.hash("pass123", 10);

  // ===============================
  // 1. CREATE ADMIN USERS + PROFILES
  // ===============================
  const adminUsers = [];
  for (let i = 0; i < 3; i++) {
    const user = await prisma.user.create({
      data: {
        username: i === 0 ? "superadmin" : `admin${i}`,
        email: i === 0 ? "superadmin@example.com" : `admin${i}@example.com`,
        phone: `010000000${i}`,
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });

    await prisma.admin.create({ data: { userId: user.id } });
    adminUsers.push(user);
  }

  // ===============================
  // 2. CREATE GRADES
  // ===============================
  const gradeIds: number[] = [];
  for (let i = 1; i <= 6; i++) {
    const grade = await prisma.grade.create({ data: { level: i } });
    gradeIds.push(grade.id);
  }

  // ===============================
  // 3. CREATE CLASSES
  // ===============================
  const classIds: number[] = [];
  for (let i = 1; i <= 6; i++) {
    const cls = await prisma.class.create({
      data: { name: `${i}A`, gradeId: gradeIds[i - 1], capacity: 20 },
    });
    classIds.push(cls.id);
  }

  // ===============================
  // 4. CREATE SUBJECTS
  // ===============================
  const subjectNames = [
    "Mathematics",
    "Science",
    "English",
    "History",
    "Geography",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "Art",
  ];
  const subjectIds: number[] = [];
  for (const name of subjectNames) {
    const subject = await prisma.subject.create({ data: { name } });
    subjectIds.push(subject.id);
  }

  // ===============================
  // 5. CREATE TEACHERS
  // ===============================
  const teacherIds: string[] = [];
  for (let i = 1; i <= 15; i++) {
    const user = await prisma.user.create({
      data: {
        username: `teacher${i}`,
        email: `teacher${i}@example.com`,
        phone: `12345678${i}`,
        password: hashedPassword,
        role: Role.TEACHER,
      },
    });

    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        username: `teacher${i}`,
        name: `TName${i}`,
        surname: `TSurname${i}`,
        email: `teacher${i}@example.com`,
        phone: `12345678${i}`,
        address: `Address ${i}`,
        bloodType: "A+",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        birthday: new Date(1990, 1, 1),
        subjects: { connect: [{ id: subjectIds[i % subjectIds.length] }] },
        classes: { connect: [{ id: classIds[i % classIds.length] }] },
      },
    });

    teacherIds.push(teacher.id);
  }

  // ===============================
  // 6. CREATE PERIODS
  // ===============================
  const periodIds: number[] = [];
  for (let i = 1; i <= 30; i++) {
    const period = await prisma.period.create({
      data: {
        name: `Period ${i}`,
        day: Object.values(Day)[i % 5],
        startTime: new Date(2024, 1, 1, 9, 0),
        endTime: new Date(2024, 1, 1, 11, 0),
        classId: classIds[i % classIds.length],
        subjectId: subjectIds[i % subjectIds.length],
        teacherId: teacherIds[i % teacherIds.length],
      },
    });
    periodIds.push(period.id);
  }

  // ===============================
  // 7. CREATE PARENTS
  // ===============================
  const parentIds: string[] = [];
  for (let i = 1; i <= 25; i++) {
    const user = await prisma.user.create({
      data: {
        username: `parent${i}`,
        email: `parent${i}@example.com`,
        phone: `01755555${i}`,
        password: hashedPassword,
        role: Role.PARENT,
      },
    });

    const parent = await prisma.parent.create({
      data: {
        userId: user.id,
        username: `parent${i}`,
        name: `PName${i}`,
        surname: `PSurname${i}`,
        phone: `01755555${i}`,
        address: `Address ${i}`,
      },
    });

    parentIds.push(parent.id);
  }

  // ===============================
  // 8. CREATE STUDENTS
  // ===============================
  for (let i = 1; i <= 50; i++) {
    const user = await prisma.user.create({
      data: {
        username: `student${i}`,
        email: `student${i}@example.com`,
        phone: `01988888${i}`,
        password: hashedPassword,
        role: Role.STUDENT,
      },
    });

    await prisma.student.create({
      data: {
        userId: user.id,
        username: `student${i}`,
        name: `SName${i}`,
        surname: `SSurname${i}`,
        email: `student${i}@example.com`,
        phone: `01988888${i}`,
        address: `Address ${i}`,
        bloodType: "O-",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        birthday: new Date(2014, 1, 1),
        classId: classIds[i % classIds.length],
        gradeId: gradeIds[i % gradeIds.length],
        parentId: parentIds[i % parentIds.length],
      },
    });
  }

  // ===============================
  // 9. CREATE EXAMS
  // ===============================
  // Class Tests
  for (let i = 0; i < 10; i++) {
    await prisma.exam.create({
      data: {
        title: `Class Test ${i + 1}`,
        type: ExamType.CLASS_TEST,
        startTime: new Date(2025, 0, i + 1, 10, 0),
        endTime: new Date(2025, 0, i + 1, 11, 0),
        periodId: periodIds[i % periodIds.length],
        subjectId: subjectIds[i % subjectIds.length],
      },
    });
  }

  // Mid-term Exams
  for (let i = 0; i < classIds.length; i++) {
    await prisma.exam.create({
      data: {
        title: `Mid Term - Class ${i + 1}A`,
        type: ExamType.MID_TERM,
        startTime: new Date(2025, 1, 10, 9, 0),
        endTime: new Date(2025, 1, 10, 12, 0),
        periodId: periodIds[i % periodIds.length],
        classId: classIds[i],
      },
    });
  }

  // Term Final Exams
  for (let i = 0; i < classIds.length; i++) {
    await prisma.exam.create({
      data: {
        title: `Term Final - Class ${i + 1}A`,
        type: ExamType.TERM_FINAL,
        startTime: new Date(2025, 2, 15, 9, 0),
        endTime: new Date(2025, 2, 15, 12, 0),
        periodId: periodIds[i % periodIds.length],
        classId: classIds[i],
      },
    });
  }

  // Retake Exam
  const originalExam = await prisma.exam.findFirst({
    where: { type: ExamType.MID_TERM },
  });
  if (originalExam) {
    await prisma.exam.create({
      data: {
        title: `Mid Term Retake - ${originalExam.title}`,
        type: ExamType.RETAKE,
        startTime: new Date(2025, 3, 5, 9, 0),
        endTime: new Date(2025, 3, 5, 12, 0),
        periodId: periodIds[0],
        classId: originalExam.classId!,
        originalExamId: originalExam.id,
      },
    });
  }

  console.log("Seeding completed successfully.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
