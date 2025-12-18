import {
  PrismaClient,
  Role,
  UserSex,
  Day,
  ExamCategory,
  AssignmentType,
  GradeLetter,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  const hashedPassword = await bcrypt.hash("pass123", 10);

  // ===============================
  // 1. CREATE ADMIN USERS
  // ===============================
  const adminUsers = [];
  for (let i = 0; i < 2; i++) {
    const user = await prisma.user.create({
      data: {
        username: `admin${i + 1}`,
        email: `admin${i + 1}@example.com`,
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
    await prisma.admin.create({ data: { userId: user.id } });
    adminUsers.push(user);
  }

  // ===============================
  // 2. CREATE SUBJECTS
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

  const subjects = [];
  for (const name of subjectNames) {
    const sub = await prisma.subject.create({ data: { name } });
    subjects.push(sub);
  }

  // ===============================
  // 3. CREATE TEACHERS
  // ===============================
  const teachers = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        username: `teacher${i}`,
        email: `teacher${i}@example.com`,
        password: hashedPassword,
        role: Role.TEACHER,
      },
    });

    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        name: `TName${i}`,
        surname: `TSurname${i}`,
        email: user.email!,
        phone: `012345678${i}`,
        subjects: {
          connect: [
            { id: subjects[i % subjects.length].id },
            { id: subjects[(i + 1) % subjects.length].id },
          ], // connect 2 subjects per teacher
        },
      },
    });

    teachers.push(teacher);
  }

  // ===============================
  // 4. CREATE CLASSES, SECTIONS, SEMESTERS, EXAM SESSIONS
  // ===============================
  const classes: any[] = [];
  for (let i = 1; i <= 3; i++) {
    const cls = await prisma.class.create({
      data: {
        name: `Class ${i}`,
        supervisorId: teachers[i % teachers.length].id,
      },
    });

    const section = await prisma.section.create({
      data: {
        name: "A",
        capacity: 30,
        roomNumber: `101-${i}`,
        classId: cls.id,
        classTeacherId: teachers[i % teachers.length].id,
      },
    });

    const semester = await prisma.semester.create({
      data: {
        name: `Semester 1`,
        startDate: new Date(2025, 0, 1),
        endDate: new Date(2025, 5, 30),
        classId: cls.id,
      },
    });

    const examSession = await prisma.examSession.create({
      data: {
        name: `Mid Term Exams`,
        startDate: new Date(2025, 1, 1),
        endDate: new Date(2025, 1, 15),
        semesterId: semester.id,
      },
    });

    classes.push({ cls, section, semester, examSession });
  }

  // ===============================
  // 5. CREATE PARENTS + STUDENTS
  // ===============================
  const parents = [];
  const students: any[] = [];

  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        username: `parent${i}`,
        email: `parent${i}@example.com`,
        password: hashedPassword,
        role: Role.PARENT,
      },
    });

    const parent = await prisma.parent.create({
      data: {
        userId: user.id,
        name: `PName${i}`,
        surname: `PSurname${i}`,
        phone: `017000000${i}`,
      },
    });

    parents.push(parent);

    for (let j = 1; j <= 3; j++) {
      const studentUser = await prisma.user.create({
        data: {
          username: `student${i}-${j}`,
          email: `student${i}-${j}@example.com`,
          password: hashedPassword,
          role: Role.STUDENT,
        },
      });

      const clsIndex = (i + j - 2) % classes.length; // safe index
      const student = await prisma.student.create({
        data: {
          userId: studentUser.id,
          name: `SName${i}-${j}`,
          surname: `SSurname${i}-${j}`,
          sex: j % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
          birthday: new Date(2015, 0, j),
          parentId: parent.id,
          sectionId: classes[clsIndex].section.id,
          classId: classes[clsIndex].cls.id,
        },
      });

      students.push(student);
    }
  }

  // ===============================
  // 6. CREATE PERIODS
  // ===============================
  const periods = [];
  for (let i = 0; i < 9; i++) {
    const clsIndex = i % classes.length;
    const period = await prisma.period.create({
      data: {
        name: `Period ${i + 1}`,
        day: Object.values(Day)[i % 5],
        order: i + 1,
        startTime: new Date(2025, 0, 1, 9 + i, 0),
        endTime: new Date(2025, 0, 1, 10 + i, 0),
        sectionId: classes[clsIndex].section.id,
        subjectId: subjects[i % subjects.length].id,
        teacherId: teachers[i % teachers.length].id,
      },
    });
    periods.push(period);
  }

  // ===============================
  // 7. CREATE ASSIGNMENTS
  // ===============================
  const assignments = [];
  for (let i = 0; i < periods.length; i++) {
    const assignment = await prisma.assignment.create({
      data: {
        title: `Assignment ${i + 1}`,
        type: AssignmentType.PERIODIC,
        totalMarks: 100,
        startDate: new Date(2025, 0, 1),
        dueDate: new Date(2025, 0, 10),
        periodId: periods[i].id,
        teacherId: periods[i].teacherId,
      },
    });
    assignments.push(assignment);
  }

  // ===============================
  // 8. CREATE EXAMS
  // ===============================
  const exams = [];
  for (let i = 0; i < periods.length; i++) {
    const clsIndex = i % classes.length;
    const exam = await prisma.exam.create({
      data: {
        title: `Class Test ${i + 1}`,
        category: ExamCategory.CLASS_TEST,
        examDate: new Date(2025, 0, i + 1),
        startTime: new Date(2025, 0, i + 1, 10, 0),
        endTime: new Date(2025, 0, i + 1, 11, 0),
        periodId: periods[i].id,
        subjectId: periods[i].subjectId,
        sectionId: periods[i].sectionId,
        examSessionId: classes[clsIndex].examSession.id,
        totalMarks: 100,
      },
    });
    exams.push(exam);
  }

  // ===============================
  // 9. CREATE RESULTS + GPA + ATTENDANCE
  // ===============================
  for (const student of students) {
    // RESULTS
    for (const exam of exams) {
      await prisma.result.create({
        data: {
          studentId: student.id,
          examId: exam.id,
          score: Math.floor(Math.random() * 101),
          remarks: "Good",
        },
      });
    }

    for (const assignment of assignments) {
      await prisma.result.create({
        data: {
          studentId: student.id,
          assignmentId: assignment.id,
          score: Math.floor(Math.random() * 101),
          remarks: "Well Done",
        },
      });
    }

    // ATTENDANCE
    for (const period of periods) {
      await prisma.attendance.create({
        data: {
          studentId: student.id,
          periodId: period.id,
          date: new Date(2025, 0, 1),
          present: Math.random() > 0.2,
        },
      });
    }

    // GPA
    for (const cls of classes) {
      await prisma.gPA.create({
        data: {
          studentId: student.id,
          semesterId: cls.semester.id,
          sectionId: cls.section.id,
          value: parseFloat((Math.random() * 4).toFixed(2)),
          grade: [GradeLetter.A, GradeLetter.B, GradeLetter.C][
            Math.floor(Math.random() * 3)
          ],
        },
      });
    }
  }

  // ===============================
  // 10. CREATE EVENTS & ANNOUNCEMENTS
  // ===============================
  for (const cls of classes) {
    await prisma.event.create({
      data: {
        title: `Event for ${cls.cls.name}`,
        description: `Description for ${cls.cls.name}`,
        startTime: new Date(2025, 0, 15, 9, 0),
        endTime: new Date(2025, 0, 15, 12, 0),
        classId: cls.cls.id,
      },
    });

    await prisma.announcement.create({
      data: {
        title: `Announcement for ${cls.cls.name}`,
        description: `Announcement Description`,
        date: new Date(),
        classId: cls.cls.id,
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
