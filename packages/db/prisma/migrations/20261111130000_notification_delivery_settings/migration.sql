ALTER TABLE "notification_permissions"
  DROP COLUMN "applications",
  DROP COLUMN "new_articles",
  DROP COLUMN "standard_notifications",
  DROP COLUMN "group_messages",
  DROP COLUMN "mark_rules_updates",
  DROP COLUMN "receipts",
  DROP COLUMN "registration_by_administrator",
  DROP COLUMN "registration_start",
  ADD COLUMN "delivery_settings" JSONB NOT NULL DEFAULT '{}';

ALTER TABLE "notification_permissions" RENAME TO "notification_settings";
ALTER TABLE "notification_settings" RENAME CONSTRAINT "notification_permissions_pkey" TO "notification_settings_pkey";
ALTER TABLE "notification_settings" RENAME CONSTRAINT "notification_permissions_user_id_fkey" TO "notification_settings_user_id_fkey";
ALTER INDEX "notification_permissions_user_id_key" RENAME TO "notification_settings_user_id_key";
ALTER TRIGGER "notification_permissions_audit" ON "notification_settings" RENAME TO "notification_settings_audit";

ALTER TABLE "ow_user" RENAME COLUMN "notification_permissions_id" TO "notification_settings_id";
ALTER INDEX "ow_user_notification_permissions_id_key" RENAME TO "ow_user_notification_settings_id_key";
