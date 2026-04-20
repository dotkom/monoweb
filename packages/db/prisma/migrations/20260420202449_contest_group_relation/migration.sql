/*
  Warnings:

  - Added the required column `group_id` to the `contest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contest" ADD COLUMN     "group_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "contest" ADD CONSTRAINT "contest_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
