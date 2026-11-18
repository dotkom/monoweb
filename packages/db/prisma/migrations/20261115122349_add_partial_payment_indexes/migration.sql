/*
  Warnings:

  - A unique constraint covering the columns `[payment_id]` on the table `payment_attempt` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[payment_attempt_id]` on the table `payment_refund` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "payment_attempt_one_active";

-- DropIndex
DROP INDEX "payment_refund_one_pending";

-- CreateIndex
CREATE UNIQUE INDEX "payment_attempt_one_active" ON "payment_attempt"("payment_id") WHERE (status IN ('CREATED', 'CHECKOUT_OPEN', 'PROCESSING', 'AUTHORIZED'));

-- CreateIndex
CREATE UNIQUE INDEX "payment_refund_one_pending" ON "payment_refund"("payment_attempt_id") WHERE (status IN ('REQUESTED', 'PENDING'));
