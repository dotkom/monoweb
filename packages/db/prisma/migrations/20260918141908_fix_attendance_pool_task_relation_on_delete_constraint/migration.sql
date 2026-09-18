-- DropForeignKey
ALTER TABLE "attendance_pool" DROP CONSTRAINT "attendance_pool_task_id_fkey";

-- AddForeignKey
ALTER TABLE "attendance_pool" ADD CONSTRAINT "attendance_pool_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
