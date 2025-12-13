import { PrismaClient, Role, UserSex, Day } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // ===============================
  //  Password hashing
  // ===============================
  const hashedPassword = await bcrypt.hash("pass123", 10);

  //
  // ================================
  // 1. CREATE USERS (SYSTEM ACCOUNTS)
  // ================================
  //

  // SUPER ADMIN
  const superAdminUser = await prisma.user.create({
    data: {
      username: "superadmin",
      email: "superadmin@example.com",
      phone: "0100000000",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  // ADMINS
  const adminUsers: any[] = [];
  for (let i = 1; i <= 2; i++) {
    adminUsers.push(
      await prisma.user.create({
        data: {
          username: `admin${i}`,
          email: `admin${i}@example.com`,
          phone: `018000000${i}`,
          password: hashedPassword,
          role: Role.ADMIN,
        },
      })
    );
  }

  //
  // ===================================
  // 2. CREATE ADMIN PROFILES LINKED TO USERS
  // ===================================
  //

  for (let i = 0; i < adminUsers.length; i++) {
    await prisma.admin.create({
      data: {
        userId: adminUsers[i].id,
      },
    });
  }

  //
  // ===========================
  // 3. CREATE GRADES
  // ===========================
  //
  const gradeIds: number[] = [];

  for (let i = 1; i <= 6; i++) {
    const grade = await prisma.grade.create({
      data: { level: i },
    });
    gradeIds.push(grade.id);
  }

  //
  // ===========================
  // 4. CREATE CLASSES
  // ===========================
  //

  const classIds: number[] = [];
  for (let i = 1; i <= 6; i++) {
    const c = await prisma.class.create({
      data: {
        name: `${i}A`,
        gradeId: gradeIds[i - 1],
        capacity: Math.floor(Math.random() * (20 - 15 + 1)) + 15,
      },
    });
    classIds.push(c.id);
  }

  //
  // ===========================
  // 5. CREATE SUBJECTS
  // ===========================
  //

  const subjects = [
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

  for (const name of subjects) {
    const subject = await prisma.subject.create({ data: { name } });
    subjectIds.push(subject.id);
  }

  //
  // ==============================
  // 6. CREATE TEACHERS
  // ==============================
  //

  const teacherIds: string[] = [];

  for (let i = 1; i <= 15; i++) {
    const user = await prisma.user.create({
      data: {
        username: `teacher${i}`,
        email: `teacher${i}@example.com`,
        phone: `123-456-789${i}`,
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
        phone: `123-456-789${i}`,
        address: `Address ${i}`,
        bloodType: "A+",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        birthday: new Date(
          new Date().setFullYear(new Date().getFullYear() - 30)
        ),
        subjects: { connect: [{ id: subjectIds[i % 10] }] },
        classes: { connect: [{ id: classIds[i % 6] }] },
      },
    });

    teacherIds.push(teacher.id);
  }

  //
  // ==============================
  // 7. CREATE LESSONS
  // ==============================
  //

  const lessonIds: number[] = [];

  for (let i = 1; i <= 30; i++) {
    const lesson = await prisma.lesson.create({
      data: {
        name: `Lesson ${i}`,
        day: Day[Object.keys(Day)[i % 5] as keyof typeof Day],
        startTime: new Date(new Date().setHours(9)),
        endTime: new Date(new Date().setHours(11)),
        classId: classIds[i % 6],
        subjectId: subjectIds[i % 10],
        teacherId: teacherIds[i % 15],
      },
    });
    lessonIds.push(lesson.id);
  }

  //
  // ==============================
  // 8. CREATE PARENTS
  // ==============================
  //

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

  //
  // ==============================
  // 9. CREATE STUDENTS
  // ==============================
  //

  const studentIds: string[] = [];

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

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        username: `student${i}`,
        name: `SName${i}`,
        surname: `SSurname${i}`,
        email: `student${i}@example.com`,
        phone: `01988888${i}`,
        address: `Address${i}`,
        bloodType: "O-",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        classId: classIds[i % 6],
        gradeId: gradeIds[i % 6],
        parentId: parentIds[i % 25],
        birthday: new Date(
          new Date().setFullYear(new Date().getFullYear() - 10)
        ),
      },
    });

    studentIds.push(student.id);
  }

  //
  // ==============================
  // 10. CREATE EXAMS
  // ==============================
  //

  const examIds: number[] = [];

  for (let i = 1; i <= 10; i++) {
    const exam = await prisma.exam.create({
      data: {
        title: `Exam ${i}`,
        startTime: new Date(),
        endTime: new Date(new Date().setHours(new Date().getHours() + 1)),
        lessonId: lessonIds[i % 30],
      },
    });
    examIds.push(exam.id);
  }

  //
  // ==============================
  // 11. CREATE ASSIGNMENTS
  // ==============================
  //

  const assignmentIds: number[] = [];

  for (let i = 1; i <= 10; i++) {
    const asg = await prisma.assignment.create({
      data: {
        title: `Assignment ${i}`,
        startDate: new Date(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        lessonId: lessonIds[i % 30],
      },
    });
    assignmentIds.push(asg.id);
  }

  //
  // ==============================
  // 12. CREATE RESULTS
  // ==============================
  //

  for (let i = 1; i <= 10; i++) {
    await prisma.result.create({
      data: {
        score: 90,
        studentId: studentIds[i],
        ...(i <= 5
          ? { examId: examIds[i - 1] }
          : { assignmentId: assignmentIds[i - 6] }),
      },
    });
  }

  //
  // ==============================
  // 13. ATTENDANCE
  // ==============================
  //

  for (let i = 1; i <= 10; i++) {
    await prisma.attendance.create({
      data: {
        date: new Date(),
        present: true,
        studentId: studentIds[i],
        lessonId: lessonIds[i],
      },
    });
  }

  //
  // ==============================
  // 14. EVENTS
  // ==============================
  //

  for (let i = 1; i <= 5; i++) {
    await prisma.event.create({
      data: {
        title: `Event ${i}`,
        description: `Description for Event ${i}`,
        startTime: new Date(),
        endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
        classId: classIds[i % 5],
      },
    });
  }

  //
  // ==============================
  // 15. ANNOUNCEMENTS
  // ==============================
  //

  for (let i = 1; i <= 5; i++) {
    await prisma.announcement.create({
      data: {
        title: `Announcement ${i}`,
        description: `Description for Announcement ${i}`,
        date: new Date(),
        classId: classIds[i % 5],
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
