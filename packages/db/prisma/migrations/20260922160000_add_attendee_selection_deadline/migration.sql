-- AlterTable
ALTER TABLE "attendee" ADD COLUMN "selection_deadline" TIMESTAMPTZ(3);

-- AlterEnum
ALTER TYPE "task_type" ADD VALUE 'VERIFY_SELECTIONS';
