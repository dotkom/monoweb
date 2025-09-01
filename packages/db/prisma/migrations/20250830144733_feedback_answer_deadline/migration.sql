-- AlterEnum
ALTER TYPE "task_type" ADD VALUE 'VERIFY_FEEDBACK_ANSWERED';

-- AlterTable
ALTER TABLE "feedback_form" ADD COLUMN     "answerDeadline" TIMESTAMPTZ(3);
