/*
  Warnings:

  - The values [ATTEMPT_RESERVE_ATTENDEE,MERGE_POOLS] on the enum `task_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `attended` on the `attendee` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "task_type_new" AS ENUM ('RESERVE_ATTENDEE', 'MERGE_ATTENDANCE_POOLS');
ALTER TABLE "task" ALTER COLUMN "type" TYPE "task_type_new" USING ("type"::text::"task_type_new");
ALTER TYPE "task_type" RENAME TO "task_type_old";
ALTER TYPE "task_type_new" RENAME TO "task_type";
DROP TYPE "task_type_old";
COMMIT;

-- AlterTable
ALTER TABLE "attendee" DROP COLUMN "attended",
ADD COLUMN     "attendedAt" TIMESTAMPTZ(3);
