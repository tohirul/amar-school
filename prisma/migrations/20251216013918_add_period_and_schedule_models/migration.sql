/*
  Warnings:

  - You are about to drop the column `lessonId` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `parents` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `lessons` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `periodId` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodId` to the `attendances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodId` to the `exams` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `parents` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `students` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `teachers` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "admins" DROP CONSTRAINT "admins_userId_fkey";

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "exams" DROP CONSTRAINT "exams_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_classId_fkey";

-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_userId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_parentId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_studentId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_teacherId_fkey";

-- DropIndex
DROP INDEX "users_parentId_key";

-- DropIndex
DROP INDEX "users_studentId_key";

-- DropIndex
DROP INDEX "users_teacherId_key";

-- AlterTable
ALTER TABLE "assignments" DROP COLUMN "lessonId",
ADD COLUMN     "periodId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "attendances" DROP COLUMN "lessonId",
ADD COLUMN     "periodId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "exams" DROP COLUMN "lessonId",
ADD COLUMN     "periodId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "parents" DROP COLUMN "password",
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "students" DROP COLUMN "password",
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "teachers" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "parentId",
DROP COLUMN "studentId",
DROP COLUMN "teacherId";

-- DropTable
DROP TABLE "lessons";

-- CreateTable
CREATE TABLE "periods" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "day" "Day" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "periods_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parents" ADD CONSTRAINT "parents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periods" ADD CONSTRAINT "periods_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periods" ADD CONSTRAINT "periods_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periods" ADD CONSTRAINT "periods_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
