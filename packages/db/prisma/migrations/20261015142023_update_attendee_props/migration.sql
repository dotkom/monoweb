-- AlterTable
ALTER TABLE "attendee" ADD COLUMN "admin_registered_by_id" TEXT,
ADD COLUMN     "registered_at" TIMESTAMPTZ(3),
ADD COLUMN     "registration_mark_delay_hours" INTEGER,
ADD COLUMN     "registration_pool_delay_hours" INTEGER;

UPDATE "attendee"
SET "registration_pool_delay_hours" = NULLIF(
  ROUND(EXTRACT(EPOCH FROM ("earliest_reservation_at" - "created_at")) / 3600)::INTEGER,
  0
);

UPDATE "attendee"
SET "registered_at" = "earliest_reservation_at"
WHERE "registered" = TRUE;

-- AlterTable
ALTER TABLE "attendee" DROP COLUMN "earliest_reservation_at",
DROP COLUMN "registered";

-- AddForeignKey
ALTER TABLE "attendee" ADD CONSTRAINT "attendee_admin_registered_by_id_fkey" FOREIGN KEY ("admin_registered_by_id") REFERENCES "ow_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "attendee_admin_registered_by_id_idx" ON "attendee"("admin_registered_by_id");