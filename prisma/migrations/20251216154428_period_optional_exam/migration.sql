-- DropForeignKey
ALTER TABLE "exams" DROP CONSTRAINT "exams_periodId_fkey";

-- AlterTable
ALTER TABLE "exams" ALTER COLUMN "periodId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
