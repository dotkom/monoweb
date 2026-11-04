-- AlterTable
ALTER TABLE "attendee" ADD COLUMN "admin_registered_by_user_id" TEXT,
ADD COLUMN     "registered_at" TIMESTAMPTZ(3),
ADD COLUMN     "registration_mark_delay_hours" INTEGER,
ADD COLUMN     "registration_pool_delay_hours" INTEGER;

-- Recover whole-hour delays despite small differences between application and database timestamps.
UPDATE "attendee"
SET "registration_pool_delay_hours" = NULLIF(
  GREATEST(ROUND(EXTRACT(EPOCH FROM ("earliest_reservation_at" - "created_at")) / 3600), 0)::INTEGER,
  0
);

UPDATE "attendee"
SET "registered_at" = "earliest_reservation_at"
WHERE "registered" = TRUE;

-- AlterTable
ALTER TABLE "attendee" DROP COLUMN "earliest_reservation_at",
DROP COLUMN "registered";

ALTER TABLE "attendee" RENAME COLUMN "payment_refunded_by_id" TO "payment_refunded_by_user_id";

ALTER TABLE "attendee" RENAME CONSTRAINT "attendee_payment_refunded_by_id_fkey" TO "attendee_payment_refunded_by_user_id_fkey";

ALTER INDEX "attendee_payment_refunded_by_id_idx" RENAME TO "attendee_payment_refunded_by_user_id_idx";

-- AddForeignKey
ALTER TABLE "attendee" ADD CONSTRAINT "attendee_admin_registered_by_user_id_fkey" FOREIGN KEY ("admin_registered_by_user_id") REFERENCES "ow_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "attendee_admin_registered_by_user_id_idx" ON "attendee"("admin_registered_by_user_id");
