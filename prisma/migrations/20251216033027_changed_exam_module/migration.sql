/*
  Warnings:

  - Added the required column `type` to the `exams` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('CLASS_TEST', 'MID_TERM', 'TERM_FINAL', 'RETAKE');

-- AlterTable
ALTER TABLE "exams" ADD COLUMN     "classId" INTEGER,
ADD COLUMN     "originalExamId" INTEGER,
ADD COLUMN     "subjectId" INTEGER,
ADD COLUMN     "type" "ExamType" NOT NULL;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_originalExamId_fkey" FOREIGN KEY ("originalExamId") REFERENCES "exams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
