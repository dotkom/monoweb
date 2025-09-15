/*
  Warnings:

  - The values [CHARGE_ATTENDANCE_PAYMENTS] on the enum `task_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "task_type_new" AS ENUM ('RESERVE_ATTENDEE', 'CHARGE_ATTENDEE', 'MERGE_ATTENDANCE_POOLS', 'VERIFY_PAYMENT', 'VERIFY_FEEDBACK_ANSWERED');

-- Manually inserted to delete all the old tasks of the old kind.
DELETE FROM "task" WHERE "type" = 'CHARGE_ATTENDANCE_PAYMENTS';

ALTER TABLE "task" ALTER COLUMN "type" TYPE "task_type_new" USING ("type"::text::"task_type_new");
ALTER TYPE "task_type" RENAME TO "task_type_old";
ALTER TYPE "task_type_new" RENAME TO "task_type";
DROP TYPE "task_type_old";
COMMIT;
