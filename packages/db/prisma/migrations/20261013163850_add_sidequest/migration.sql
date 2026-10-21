-- CreateEnum
CREATE TYPE "sidequest_status" AS ENUM ('IN_REVIEW', 'PUBLISHED', 'REJECTED', 'DELETED');

-- AlterEnum
ALTER TYPE "NotificationPayloadType" ADD VALUE 'SIDEQUEST';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'NEW_SIDEQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'NEW_SIDEQUEST_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'SIDEQUEST_REQUEST_REVIEWED';

-- CreateTable
CREATE TABLE "sidequest" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start" TIMESTAMPTZ(3) NOT NULL,
    "end" TIMESTAMPTZ(3) NOT NULL,
    "register_end" TIMESTAMPTZ(3),
    "deregister_deadline" TIMESTAMPTZ(3),
    "image_url" TEXT,
    "location_title" TEXT,
    "location_address" TEXT,
    "location_link" TEXT,
    "capacity" INTEGER,
    "status" "sidequest_status" NOT NULL,
    "interest_group_id" TEXT NOT NULL,

    CONSTRAINT "sidequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sidequest_registration" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "sidequest_id" TEXT NOT NULL,

    CONSTRAINT "sidequest_registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sidequest_request" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "description" TEXT,
    "requested_amount" INTEGER,
    "expected_attendee_count" INTEGER,
    "approved_amount" INTEGER,
    "reviewed_at" TIMESTAMPTZ(3),
    "review_note" TEXT,
    "sidequest_id" TEXT NOT NULL,
    "requested_by_id" TEXT NOT NULL,
    "reviewed_by_id" TEXT,

    CONSTRAINT "sidequest_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sidequest_interest_group_id_idx" ON "sidequest"("interest_group_id");

-- CreateIndex
CREATE INDEX "sidequest_registration_sidequest_id_idx" ON "sidequest_registration"("sidequest_id");

-- CreateIndex
CREATE UNIQUE INDEX "sidequest_registration_user_id_sidequest_id_key" ON "sidequest_registration"("user_id", "sidequest_id");

-- CreateIndex
CREATE UNIQUE INDEX "sidequest_request_sidequest_id_key" ON "sidequest_request"("sidequest_id");

-- CreateIndex
CREATE INDEX "sidequest_request_requested_by_id_idx" ON "sidequest_request"("requested_by_id");

-- CreateIndex
CREATE INDEX "sidequest_request_reviewed_by_id_idx" ON "sidequest_request"("reviewed_by_id");

-- AddForeignKey
ALTER TABLE "sidequest" ADD CONSTRAINT "sidequest_interest_group_id_fkey" FOREIGN KEY ("interest_group_id") REFERENCES "group"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sidequest_registration" ADD CONSTRAINT "sidequest_registration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sidequest_registration" ADD CONSTRAINT "sidequest_registration_sidequest_id_fkey" FOREIGN KEY ("sidequest_id") REFERENCES "sidequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sidequest_request" ADD CONSTRAINT "sidequest_request_sidequest_id_fkey" FOREIGN KEY ("sidequest_id") REFERENCES "sidequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sidequest_request" ADD CONSTRAINT "sidequest_request_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sidequest_request" ADD CONSTRAINT "sidequest_request_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "ow_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add audit triggers
CREATE TRIGGER sidequest_audit
AFTER INSERT OR UPDATE OR DELETE ON "sidequest"
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER sidequest_registration_audit
AFTER INSERT OR UPDATE OR DELETE ON "sidequest_registration"
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER sidequest_request_audit
AFTER INSERT OR UPDATE OR DELETE ON "sidequest_request"
FOR EACH ROW EXECUTE FUNCTION if_modified_func();
