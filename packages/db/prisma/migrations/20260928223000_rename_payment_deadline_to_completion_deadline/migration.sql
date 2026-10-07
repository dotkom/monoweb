ALTER TABLE "attendee" RENAME COLUMN "payment_deadline" TO "completion_deadline";

ALTER TYPE "task_type" RENAME VALUE 'VERIFY_PAYMENT' TO 'VERIFY_ATTENDANCE_COMPLETION';
