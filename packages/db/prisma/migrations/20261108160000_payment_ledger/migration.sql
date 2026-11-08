BEGIN;

-- CreateEnum
CREATE TYPE "payment_attempt_status" AS ENUM ('CREATED', 'CHECKOUT_OPEN', 'PROCESSING', 'AUTHORIZED', 'CAPTURED', 'CANCELLED', 'EXPIRED', 'FAILED');

-- CreateEnum
CREATE TYPE "payment_capture_mode" AS ENUM ('AUTOMATIC', 'MANUAL');

-- CreateEnum
CREATE TYPE "payment_refund_status" AS ENUM ('REQUESTED', 'PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "description" TEXT NOT NULL,
    "amount_ore" INTEGER NOT NULL,
    "waived_at" TIMESTAMPTZ(3),
    "waiver_reason" TEXT,
    "user_id" TEXT NOT NULL,
    "waived_by_user_id" TEXT,
    "attendee_id" TEXT,
    "event_id" TEXT,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_attempt" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "payment_attempt_status" NOT NULL DEFAULT 'CREATED',
    "capture_mode" "payment_capture_mode" NOT NULL,
    "stripe_checkout_session_id" TEXT,
    "stripe_payment_intent_id" TEXT,
    "checkout_url" TEXT,
    "checkout_expires_at" TIMESTAMPTZ(3),
    "capture_scheduled_at" TIMESTAMPTZ(3),
    "authorization_expires_at" TIMESTAMPTZ(3),
    "authorized_at" TIMESTAMPTZ(3),
    "captured_at" TIMESTAMPTZ(3),
    "last_synced_at" TIMESTAMPTZ(3),
    "payment_id" TEXT NOT NULL,

    CONSTRAINT "payment_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_refund" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripe_refund_id" TEXT,
    "amount_ore" INTEGER NOT NULL,
    "status" "payment_refund_status" NOT NULL DEFAULT 'REQUESTED',
    "reason" TEXT,
    "payment_attempt_id" TEXT NOT NULL,
    "requested_by_user_id" TEXT,

    CONSTRAINT "payment_refund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_attendee_id_key" ON "payment"("attendee_id");

-- CreateIndex
CREATE INDEX "payment_user_id_idx" ON "payment"("user_id");

-- CreateIndex
CREATE INDEX "payment_waived_by_user_id_idx" ON "payment"("waived_by_user_id");

-- CreateIndex
CREATE INDEX "payment_event_id_idx" ON "payment"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_attempt_stripe_checkout_session_id_key" ON "payment_attempt"("stripe_checkout_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_attempt_stripe_payment_intent_id_key" ON "payment_attempt"("stripe_payment_intent_id");

-- CreateIndex
CREATE INDEX "payment_attempt_payment_id_created_at_idx" ON "payment_attempt"("payment_id", "created_at");

-- CreateIndex
CREATE INDEX "payment_attempt_status_capture_scheduled_at_idx" ON "payment_attempt"("status", "capture_scheduled_at");

-- CreateIndex
CREATE UNIQUE INDEX "payment_refund_stripe_refund_id_key" ON "payment_refund"("stripe_refund_id");

-- CreateIndex
CREATE INDEX "payment_refund_payment_attempt_id_created_at_idx" ON "payment_refund"("payment_attempt_id", "created_at");

-- CreateIndex
CREATE INDEX "payment_refund_requested_by_user_id_idx" ON "payment_refund"("requested_by_user_id");

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_waived_by_user_id_fkey" FOREIGN KEY ("waived_by_user_id") REFERENCES "ow_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_attendee_id_fkey" FOREIGN KEY ("attendee_id") REFERENCES "attendee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_attempt" ADD CONSTRAINT "payment_attempt_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_refund" ADD CONSTRAINT "payment_refund_payment_attempt_id_fkey" FOREIGN KEY ("payment_attempt_id") REFERENCES "payment_attempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_refund" ADD CONSTRAINT "payment_refund_requested_by_user_id_fkey" FOREIGN KEY ("requested_by_user_id") REFERENCES "ow_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Preserve the legacy registration policy: a completed refund with no remaining
-- completion deadline previously exempted the attendee from paying again.
-- The one-time payments:migrate command fills in original amounts and provider
-- refund IDs before the updated application starts.
INSERT INTO payment (
  id, created_at, updated_at, description, amount_ore,
  waived_at, waiver_reason, user_id, waived_by_user_id, attendee_id, event_id
)
SELECT
  'attendance-payment:' || attendee.id,
  attendee.created_at,
  attendee.updated_at,
  COALESCE(event.title, 'Imported event payment'),
  COALESCE(attendance.attendance_price, 0) * 100,
  CASE WHEN attendee.payment_refunded_at IS NOT NULL AND attendee.completion_deadline IS NULL
    THEN attendee.payment_refunded_at END,
  CASE WHEN attendee.payment_refunded_at IS NOT NULL AND attendee.completion_deadline IS NULL
    THEN 'Imported exemption from the previous refunded-registration policy' END,
  attendee.user_id,
  CASE WHEN attendee.payment_refunded_at IS NOT NULL AND attendee.completion_deadline IS NULL
    THEN attendee.payment_refunded_by_user_id END,
  attendee.id,
  event.id
FROM attendee
JOIN attendance ON attendance.id = attendee.attendance_id
LEFT JOIN LATERAL (
  SELECT event.id, event.title
  FROM event
  WHERE event.attendance_id = attendance.id
  ORDER BY event.created_at, event.id
  LIMIT 1
) event ON true
WHERE attendee.payment_id IS NOT NULL
  OR attendee.payment_reserved_at IS NOT NULL
  OR attendee.payment_charged_at IS NOT NULL
  OR attendee.payment_refunded_at IS NOT NULL
  OR attendee.payment_refunded_by_user_id IS NOT NULL
  OR (attendance.attendance_price > 0 AND attendee.registered_at IS NOT NULL);

INSERT INTO payment_attempt (
  id, created_at, updated_at, status, capture_mode,
  stripe_checkout_session_id, stripe_payment_intent_id, checkout_url,
  capture_scheduled_at, authorized_at, captured_at, payment_id
)
SELECT
  payment.id || ':legacy',
  payment.created_at,
  payment.updated_at,
  CASE
    WHEN attendee.payment_refunded_at IS NOT NULL OR attendee.payment_charged_at IS NOT NULL THEN 'CAPTURED'
    WHEN attendee.payment_reserved_at IS NOT NULL THEN 'AUTHORIZED'
    WHEN attendee.payment_id IS NOT NULL THEN 'CHECKOUT_OPEN'
    ELSE 'CANCELLED'
  END::payment_attempt_status,
  CASE WHEN attendee.payment_charge_deadline IS NULL THEN 'AUTOMATIC' ELSE 'MANUAL' END::payment_capture_mode,
  attendee.payment_id,
  CASE WHEN attendee.payment_checkout_url LIKE '%/pi_%'
    THEN regexp_replace(attendee.payment_checkout_url, '^.*/', '') END,
  attendee.payment_link,
  attendee.payment_charge_deadline,
  attendee.payment_reserved_at,
  COALESCE(attendee.payment_charged_at, attendee.payment_refunded_at),
  payment.id
FROM payment
JOIN attendee ON attendee.id = payment.attendee_id
WHERE attendee.payment_id IS NOT NULL
  OR attendee.payment_reserved_at IS NOT NULL
  OR attendee.payment_charged_at IS NOT NULL
  OR attendee.payment_refunded_at IS NOT NULL
  OR attendee.payment_refunded_by_user_id IS NOT NULL;

INSERT INTO payment_refund (
  id, created_at, updated_at, amount_ore, status,
  reason, payment_attempt_id, requested_by_user_id
)
SELECT
  payment.id || ':legacy-refund',
  attendee.payment_refunded_at,
  attendee.payment_refunded_at,
  payment.amount_ore,
  'SUCCEEDED',
  'Imported refund; provider details are completed by payments:migrate',
  payment.id || ':legacy',
  attendee.payment_refunded_by_user_id
FROM payment
JOIN attendee ON attendee.id = payment.attendee_id
WHERE attendee.payment_refunded_at IS NOT NULL;

-- Bind existing captures to their original attempt so a replacement checkout
-- can never be charged by an old task.
UPDATE task
SET payload = task.payload || jsonb_build_object('paymentAttemptId', payment_attempt.id)
FROM payment_attempt
JOIN payment ON payment.id = payment_attempt.payment_id
WHERE task.type = 'CHARGE_ATTENDEE'
  AND task.payload->>'attendeeId' = payment.attendee_id;

UPDATE task
SET status = 'SKIPPED', processed_at = CURRENT_TIMESTAMP
WHERE task.type = 'CHARGE_ATTENDEE'
  AND task.status = 'PENDING'
  AND NOT (task.payload ? 'paymentAttemptId');

ALTER TABLE payment ADD CONSTRAINT payment_amount_nonnegative CHECK (amount_ore >= 0);
-- Zero is reserved for legacy refunds whose original event price is no longer known.
ALTER TABLE payment_refund ADD CONSTRAINT payment_refund_amount_nonnegative CHECK (amount_ore >= 0);

CREATE UNIQUE INDEX payment_attempt_one_active
  ON payment_attempt(payment_id)
  WHERE status IN ('CREATED', 'CHECKOUT_OPEN', 'PROCESSING', 'AUTHORIZED');

CREATE UNIQUE INDEX payment_refund_one_pending
  ON payment_refund(payment_attempt_id)
  WHERE status IN ('REQUESTED', 'PENDING');

-- Reuse the existing database audit trail for local actions and actor attribution.
CREATE TRIGGER payment_audit
AFTER INSERT OR UPDATE OR DELETE ON payment
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER payment_attempt_audit
AFTER INSERT OR UPDATE OR DELETE ON payment_attempt
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER payment_refund_audit
AFTER INSERT OR UPDATE OR DELETE ON payment_refund
FOR EACH ROW EXECUTE FUNCTION if_modified_func();


-- Drop legacy columns only after their financial history has been copied.
-- DropForeignKey
ALTER TABLE "attendee" DROP CONSTRAINT "attendee_payment_refunded_by_user_id_fkey";

-- DropIndex
DROP INDEX "attendee_payment_refunded_by_user_id_idx";

-- AlterTable
ALTER TABLE "attendee" DROP COLUMN "payment_charge_deadline",
DROP COLUMN "payment_charged_at",
DROP COLUMN "payment_checkout_url",
DROP COLUMN "payment_id",
DROP COLUMN "payment_link",
DROP COLUMN "payment_refunded_at",
DROP COLUMN "payment_refunded_by_user_id",
DROP COLUMN "payment_reserved_at";


COMMIT;
