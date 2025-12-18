/*
  Warnings:

  - You are about to drop the column `capacity` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `gradeId` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `classId` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `parents` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `parents` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `parents` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `parents` table. All the data in the column will be lost.
  - You are about to drop the column `classId` on the `periods` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `refreshTokenHash` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `revoked` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `bloodType` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `classId` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `gradeId` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `img` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `birthday` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `bloodType` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `img` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `sex` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `failedLoginAttempts` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lockedUntil` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetExpires` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `_SubjectToTeacher` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `grades` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[studentId,periodId,date]` on the table `attendances` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sectionId,day,order]` on the table `periods` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teacherId` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalMarks` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `examDate` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalMarks` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Made the column `subjectId` on table `exams` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `order` to the `periods` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sectionId` to the `periods` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sectionId` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PeriodStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AttendanceType" AS ENUM ('REGULAR', 'EXAM');

-- CreateEnum
CREATE TYPE "ExamCategory" AS ENUM ('TERMINAL', 'CLASS_TEST', 'POP_QUIZ', 'RETAKE');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('PERIODIC', 'WEEKLY', 'SEMESTER', 'TERMINAL');

-- CreateEnum
CREATE TYPE "GradeLetter" AS ENUM ('A_PLUS', 'A', 'A_MINUS', 'B', 'C', 'D', 'F');

-- DropForeignKey
ALTER TABLE "_SubjectToTeacher" DROP CONSTRAINT "_SubjectToTeacher_A_fkey";

-- DropForeignKey
ALTER TABLE "_SubjectToTeacher" DROP CONSTRAINT "_SubjectToTeacher_B_fkey";

-- DropForeignKey
ALTER TABLE "admins" DROP CONSTRAINT "admins_userId_fkey";

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_periodId_fkey";

-- DropForeignKey
ALTER TABLE "classes" DROP CONSTRAINT "classes_gradeId_fkey";

-- DropForeignKey
ALTER TABLE "exams" DROP CONSTRAINT "exams_classId_fkey";

-- DropForeignKey
ALTER TABLE "exams" DROP CONSTRAINT "exams_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "parents" DROP CONSTRAINT "parents_userId_fkey";

-- DropForeignKey
ALTER TABLE "periods" DROP CONSTRAINT "periods_classId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_classId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_gradeId_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_userId_fkey";

-- DropForeignKey
ALTER TABLE "teachers" DROP CONSTRAINT "teachers_userId_fkey";

-- DropIndex
DROP INDEX "parents_email_key";

-- DropIndex
DROP INDEX "parents_phone_key";

-- DropIndex
DROP INDEX "parents_username_key";

-- DropIndex
DROP INDEX "sessions_userId_idx";

-- DropIndex
DROP INDEX "students_email_key";

-- DropIndex
DROP INDEX "students_phone_key";

-- DropIndex
DROP INDEX "students_username_key";

-- DropIndex
DROP INDEX "teachers_email_key";

-- DropIndex
DROP INDEX "teachers_phone_key";

-- DropIndex
DROP INDEX "teachers_username_key";

-- DropIndex
DROP INDEX "users_phone_key";

-- AlterTable
ALTER TABLE "assignments" ADD COLUMN     "description" TEXT,
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "teacherId" TEXT NOT NULL,
ADD COLUMN     "totalMarks" INTEGER NOT NULL,
ADD COLUMN     "type" "AssignmentType" NOT NULL,
ALTER COLUMN "periodId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "type" "AttendanceType" NOT NULL DEFAULT 'REGULAR';

-- AlterTable
ALTER TABLE "classes" DROP COLUMN "capacity",
DROP COLUMN "gradeId",
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "exams" DROP COLUMN "classId",
DROP COLUMN "type",
ADD COLUMN     "category" "ExamCategory" NOT NULL,
ADD COLUMN     "examDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "examSessionId" INTEGER,
ADD COLUMN     "sectionId" INTEGER,
ADD COLUMN     "totalMarks" INTEGER NOT NULL,
ALTER COLUMN "subjectId" SET NOT NULL;

-- AlterTable
ALTER TABLE "parents" DROP COLUMN "address",
DROP COLUMN "createdAt",
DROP COLUMN "email",
DROP COLUMN "username";

-- AlterTable
ALTER TABLE "periods" DROP COLUMN "classId",
ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "sectionId" INTEGER NOT NULL,
ADD COLUMN     "status" "PeriodStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "results" ADD COLUMN     "gpaId" INTEGER,
ADD COLUMN     "remarks" TEXT;

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "createdAt",
DROP COLUMN "ipAddress",
DROP COLUMN "refreshTokenHash",
DROP COLUMN "revoked",
DROP COLUMN "userAgent";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "address",
DROP COLUMN "bloodType",
DROP COLUMN "classId",
DROP COLUMN "createdAt",
DROP COLUMN "email",
DROP COLUMN "gradeId",
DROP COLUMN "img",
DROP COLUMN "phone",
DROP COLUMN "username",
ADD COLUMN     "sectionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "subjects" ADD COLUMN     "teacherId" TEXT;

-- AlterTable
ALTER TABLE "teachers" DROP COLUMN "address",
DROP COLUMN "birthday",
DROP COLUMN "bloodType",
DROP COLUMN "createdAt",
DROP COLUMN "img",
DROP COLUMN "sex",
DROP COLUMN "username";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "failedLoginAttempts",
DROP COLUMN "lockedUntil",
DROP COLUMN "passwordResetExpires",
DROP COLUMN "passwordResetToken";

-- DropTable
DROP TABLE "_SubjectToTeacher";

-- DropTable
DROP TABLE "grades";

-- DropEnum
DROP TYPE "ExamType";

-- CreateTable
CREATE TABLE "sections" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "classTeacherId" TEXT,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semesters" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "semesters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_sessions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "semesterId" INTEGER NOT NULL,

    CONSTRAINT "exam_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gpas" (
    "id" SERIAL NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "grade" "GradeLetter" NOT NULL,
    "studentId" TEXT NOT NULL,
    "semesterId" INTEGER NOT NULL,
    "sectionId" INTEGER NOT NULL,

    CONSTRAINT "gpas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sections_classId_name_key" ON "sections"("classId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "gpas_studentId_semesterId_sectionId_key" ON "gpas"("studentId", "semesterId", "sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_studentId_periodId_date_key" ON "attendances"("studentId", "periodId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "periods_sectionId_day_order_key" ON "periods"("sectionId", "day", "order");

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parents" ADD CONSTRAINT "parents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_classTeacherId_fkey" FOREIGN KEY ("classTeacherId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semesters" ADD CONSTRAINT "semesters_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periods" ADD CONSTRAINT "periods_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_examSessionId_fkey" FOREIGN KEY ("examSessionId") REFERENCES "exam_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_gpaId_fkey" FOREIGN KEY ("gpaId") REFERENCES "gpas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gpas" ADD CONSTRAINT "gpas_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gpas" ADD CONSTRAINT "gpas_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semesters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gpas" ADD CONSTRAINT "gpas_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
