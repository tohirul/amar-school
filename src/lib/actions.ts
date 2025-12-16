"use server";

import prisma from "./prisma";
import { hashValue } from "./hash";
import type {
  AnnouncementSchema,
  AssignmentSchema,
  AttendanceSchema,
  ClassSchema,
  EventSchema,
  ExamSchema,
  PeriodSchema,
  ParentSchema,
  ResultSchema,
  resultSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
} from "./formValidationSchemas";
import { ExamType } from "@prisma/client";

type CurrentState = { success: boolean; error: boolean };

// ========================== SUBJECT ==========================
export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: { id: data.id },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = parseInt(data.get("id") as string);
  try {
    await prisma.subject.delete({ where: { id } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ========================== CLASS ==========================
export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.create({ data });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({ where: { id: data.id }, data });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = parseInt(data.get("id") as string);
  try {
    await prisma.class.delete({ where: { id } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ========================== TEACHER ==========================
export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    if (!data?.password) {
      return { success: false, error: true };
    }
    const hashedPassword = await hashValue(data?.password);
    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        role: "TEACHER",
        email: data.email || null,
        phone: data.phone || null,
        isActive: true,
      },
    });

    await prisma.teacher.create({
      data: {
        userId: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    const updateData: any = {
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address,
      img: data.img || null,
      bloodType: data.bloodType,
      sex: data.sex,
      birthday: data.birthday,
      subjects: {
        set: data.subjects?.map((subjectId: string) => ({
          id: parseInt(subjectId),
        })),
      },
    };

    if (data.password && data.password !== "") {
      const hashedPassword = await hashValue(data.password);
      await prisma.user.update({
        where: { id: data.id },
        data: { password: hashedPassword },
      });
    }

    await prisma.teacher.update({
      where: { id: data.id },
      data: updateData,
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.teacher.delete({ where: { id } });
    await prisma.user.delete({ where: { id } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ========================== STUDENT ==========================
export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true };
    }
    if (!data?.password) {
      return { success: false, error: true };
    }
    const hashedPassword = await hashValue(data?.password);
    console.log("Data: ", data);
    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        role: "STUDENT",
        isActive: true,
        email: data.email || null,
        phone: data.phone || null,
      },
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) return { success: false, error: true };
  try {
    const updateData: any = {
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address,
      img: data.img || null,
      bloodType: data.bloodType,
      sex: data.sex,
      birthday: data.birthday,
      gradeId: data.gradeId,
      classId: data.classId,
      parentId: data.parentId,
    };

    if (data.password && data.password !== "") {
      const hashedPassword = await hashValue(data.password);
      await prisma.user.update({
        where: { id: data.id },
        data: { password: hashedPassword },
      });
    }

    await prisma.student.update({ where: { id: data.id }, data: updateData });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.student.delete({ where: { id } });
    await prisma.user.delete({ where: { id } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ========================== EXAM ==========================

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    const examData: any = {
      title: data.title,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      type: data.type as ExamType,
    };

    if (data.classId) examData.classId = Number(data.classId);
    if (data.periodId) examData.periodId = Number(data.periodId);
    if (data.subjectId) examData.subjectId = Number(data.subjectId);
    if (data.originalExamId)
      examData.originalExamId = Number(data.originalExamId);

    await prisma.exam.create({
      data: examData,
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema & { id?: number }
) => {
  if (!data.id) return { success: false, error: true };
  try {
    await prisma.exam.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        type: data.type as ExamType,
        classId: data.classId ? Number(data.classId) : undefined,
        periodId: data.periodId ? Number(data.periodId) : undefined,
        subjectId: data.subjectId ? Number(data.subjectId) : undefined,
        originalExamId: data.originalExamId
          ? Number(data.originalExamId)
          : undefined,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = parseInt(data.get("id") as string);
  try {
    await prisma.exam.delete({ where: { id } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ========================== PARENT ==========================
export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  try {
    if (!data.password) {
      return { success: false, error: true };
    }

    const hashedPassword = await hashValue(data.password);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        role: "PARENT",
        isActive: true,
        email: data.email || null,
        phone: data.phone,
      },
    });

    await prisma.parent.create({
      data: {
        userId: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  if (!data.id) return { success: false, error: true };

  try {
    const updateData: any = {
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone,
      address: data.address,
    };

    if (data.password && data.password !== "") {
      const hashedPassword = await hashValue(data.password);
      await prisma.user.update({
        where: { id: data.id },
        data: { password: hashedPassword },
      });
    }

    await prisma.parent.update({
      where: { id: data.id },
      data: updateData,
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ========================== Period ==========================

export const createPeriod = async (
  currentState: { success: boolean; error: boolean },
  data: PeriodSchema
) => {
  try {
    await prisma.period.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updatePeriod = async (
  currentState: { success: boolean; error: boolean },
  data: PeriodSchema
) => {
  console.log("Update Period: ", data);
  if (!data.id) return { success: false, error: true };

  try {
    await prisma.period.update({
      where: { id: data.id },
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// Delete Mutation
export const deletePeriod = async (
  currentState: { success: boolean; error: boolean },
  data: FormData
) => {
  const id = parseInt(data.get("id") as string);
  try {
    await prisma.period.delete({ where: { id } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ========================== Assignment ==========================

export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        periodId: data.periodId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// UPDATE
export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  if (!data.id) return { success: false, error: true };

  try {
    await prisma.assignment.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        periodId: data.periodId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// DELETE
export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = parseInt(data.get("id") as string);
  try {
    await prisma.assignment.delete({ where: { id } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ========================== Result ==========================
export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  console.log(data, typeof data.score);
  try {
    await prisma.result.create({
      data: {
        studentId: data.studentId,
        examId: data.examId || null,
        assignmentId: data.assignmentId || null,
        score: parseInt(data.score as any),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating result:", err);
    return { success: false, error: true };
  }
};

// UPDATE
export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema & { id?: number }
) => {
  if (!data.id) {
    console.error("Result ID is required for update");
    return { success: false, error: true };
  }

  try {
    await prisma.result.update({
      where: { id: data.id },
      data: {
        studentId: data.studentId,
        examId: data.examId || null,
        assignmentId: data.assignmentId || null,
        score: data.score,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating result:", err);
    return { success: false, error: true };
  }
};

// ========================== Attendance ==========================
export const createAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  try {
    await prisma.attendance.create({
      data: {
        date: data.date,
        present: data.present,
        studentId: data.studentId,
        periodId: data.periodId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  if (!data.id) return { success: false, error: true };

  try {
    await prisma.attendance.update({
      where: { id: data.id },
      data: {
        date: data.date,
        present: data.present,
        studentId: data.studentId,
        periodId: data.periodId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAttendance = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = parseInt(data.get("id") as string);

  try {
    await prisma.attendance.delete({ where: { id } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ========================== Event ==========================
export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId || null,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  if (!data.id) return { success: false, error: true };

  try {
    await prisma.event.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId || null,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = parseInt(data.get("id") as string);

  try {
    await prisma.event.delete({ where: { id } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ========================== ANNOUNCEMENT ==========================
export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId || null,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  if (!data.id) return { success: false, error: true };

  try {
    await prisma.announcement.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId || null,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = parseInt(data.get("id") as string);

  try {
    await prisma.announcement.delete({ where: { id } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
