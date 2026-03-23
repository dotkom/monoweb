ALTER TABLE "NotificationRecipient"
RENAME TO "notification_recipient";

ALTER TABLE "notification_recipient"
RENAME CONSTRAINT "NotificationRecipient_pkey" TO "notification_recipient_pkey";

ALTER TABLE "notification_recipient"
RENAME CONSTRAINT "NotificationRecipient_notification_id_fkey" TO "notification_recipient_notification_id_fkey";

ALTER TABLE "notification_recipient"
RENAME CONSTRAINT "NotificationRecipient_user_id_fkey" TO "notification_recipient_user_id_fkey";