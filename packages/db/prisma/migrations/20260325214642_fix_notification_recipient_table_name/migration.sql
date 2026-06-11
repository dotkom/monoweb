/*
  Warnings:

  - You are about to drop the `NotificationRecipient` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NotificationRecipient" DROP CONSTRAINT "NotificationRecipient_notification_id_fkey";

-- DropForeignKey
ALTER TABLE "NotificationRecipient" DROP CONSTRAINT "NotificationRecipient_user_id_fkey";

-- DropTable
DROP TABLE "NotificationRecipient";

-- CreateTable
CREATE TABLE "notification_recipient" (
    "id" TEXT NOT NULL,
    "read_at" TIMESTAMPTZ(3),
    "notification_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "notification_recipient_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notification_recipient" ADD CONSTRAINT "notification_recipient_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_recipient" ADD CONSTRAINT "notification_recipient_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
