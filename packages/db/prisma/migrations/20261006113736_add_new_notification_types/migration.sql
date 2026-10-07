/*
  Warnings:

  - The values [EVENT_REGISTRATION] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('BROADCAST', 'BROADCAST_IMPORTANT', 'EVENT_REMINDER', 'EVENT_UPDATE', 'ATTENDANCE_REGISTRATION', 'ATTENDANCE_DEREGISTRATION', 'ATTENDANCE_REGISTRATION_FROM_QUEUE', 'ATTENDANCE_QUEUE_UPDATE', 'ATTENDANCE_COMPLETION_FAILED', 'JOB_LISTING_REMINDER', 'NEW_ARTICLE', 'NEW_EVENT', 'NEW_INTEREST_GROUP', 'NEW_JOB_LISTING', 'NEW_OFFLINE', 'NEW_MARK', 'NEW_FEEDBACK_FORM');
ALTER TABLE "notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;
