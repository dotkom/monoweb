CREATE TYPE "NotificationStatus" AS ENUM ('DRAFT', 'SENT');

ALTER TABLE "notification"
ADD COLUMN "status" "NotificationStatus" NOT NULL DEFAULT 'SENT',
ADD COLUMN "sent_at" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "draft_recipient_selection" JSONB;

UPDATE "notification" SET "sent_at" = "created_at";
