-- CreateEnum
CREATE TYPE "NotificationPayloadType" AS ENUM ('URL', 'EVENT', 'ARTICLE', 'GROUP', 'USER', 'OFFLINE', 'JOB_LISTING', 'NONE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BROADCAST', 'BROADCAST_IMPORTANT', 'EVENT_REGISTRATION', 'EVENT_REMINDER', 'EVENT_UPDATE', 'JOB_LISTING_REMINDER', 'NEW_ARTICLE', 'NEW_EVENT', 'NEW_INTEREST_GROUP', 'NEW_JOB_LISTING', 'NEW_OFFLINE', 'NEW_MARK', 'NEW_FEEDBACK_FORM');

-- CreateTable
CREATE TABLE "NotificationRecipient" (
    "id" TEXT NOT NULL,
    "read_at" TIMESTAMPTZ(3) NOT NULL,
    "notification_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "NotificationRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "short_description" TEXT,
    "content" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "payload" TEXT,
    "payload_type" "NotificationPayloadType" NOT NULL,
    "actor_group_id" TEXT NOT NULL,
    "created_by_id" TEXT,
    "last_updated_by_id" TEXT,
    "task_id" TEXT,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_actor_group_id_fkey" FOREIGN KEY ("actor_group_id") REFERENCES "group"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "ow_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_last_updated_by_id_fkey" FOREIGN KEY ("last_updated_by_id") REFERENCES "ow_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
