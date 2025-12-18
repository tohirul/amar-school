-- DropForeignKey
ALTER TABLE "exams" DROP CONSTRAINT "exams_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "periods" DROP CONSTRAINT "periods_subjectId_fkey";

-- AddForeignKey
ALTER TABLE "periods" ADD CONSTRAINT "periods_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
