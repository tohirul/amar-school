import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { getSession } from "@/lib/sessions";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "period"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  // Get current user from custom session
  const session = await getSession();
  const currentUser = session?.user;
  const currentUserId = currentUser?.id;
  const role = currentUser?.role;
  // console.log(session?.user);
  if (type !== "delete") {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: subjectTeachers };
        break;
      case "class":
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: classTeachers, grades: classGrades };
        break;
      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: teacherSubjects };
        break;
      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });
        relatedData = { classes: studentClasses, grades: studentGrades };
        break;
      case "exam":
        const examPeriods = await prisma.period.findMany({
          where: {
            ...(role === "TEACHER" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        const classes = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        const subjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { periods: examPeriods, classes, subjects };

        break;
      case "result":
        const resultStudents = await prisma.student.findMany({
          select: { id: true, name: true, surname: true },
        });
        const resultExams = await prisma.exam.findMany({
          select: { id: true, title: true },
        });
        const resultAssignments = await prisma.assignment.findMany({
          select: { id: true, title: true },
        });
        relatedData = {
          students: resultStudents,
          exams: resultExams,
          assignments: resultAssignments,
        };
        break;
      case "period":
        const periodSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        const periodTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        const periodClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = {
          subjects: periodSubjects,
          teachers: periodTeachers,
          classes: periodClasses,
        };
        break;
      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
