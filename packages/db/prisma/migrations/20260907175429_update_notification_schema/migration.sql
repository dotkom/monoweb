/*
  Warnings:

  - A unique constraint covering the columns `[notification_id,user_id]` on the table `notification_recipient` will be added. If there are existing duplicate values, this will fail.
  - Made the column `short_description` on table `notification` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "task_type" ADD VALUE 'NOTIFICATION_SEND_EVENT_REGISTRATION';
ALTER TYPE "task_type" ADD VALUE 'NOTIFICATION_SEND_EVENT_REMINDER';
ALTER TYPE "task_type" ADD VALUE 'NOTIFICATION_SEND_JOB_LISTING_REMINDER';

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_actor_group_id_fkey";

-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "audience" JSONB,
ALTER COLUMN "short_description" SET NOT NULL,
ALTER COLUMN "actor_group_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "notification_recipient" ALTER COLUMN "read_at" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "notification_created_at_idx" ON "notification"("created_at");

-- CreateIndex
CREATE INDEX "notification_payload_type_payload_idx" ON "notification"("payload_type", "payload");

-- CreateIndex
CREATE INDEX "notification_recipient_user_id_read_at_idx" ON "notification_recipient"("user_id", "read_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_recipient_notification_id_user_id_key" ON "notification_recipient"("notification_id", "user_id");

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_actor_group_id_fkey" FOREIGN KEY ("actor_group_id") REFERENCES "group"("slug") ON DELETE SET NULL ON UPDATE CASCADE;
