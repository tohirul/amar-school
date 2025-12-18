-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_periodId_fkey";

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
