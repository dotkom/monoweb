-- AlterTable
ALTER TABLE "attendance_pool" ADD COLUMN     "taskId" TEXT;

-- AddForeignKey
ALTER TABLE "attendance_pool" ADD CONSTRAINT "attendance_pool_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
