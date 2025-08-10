/*
  Warnings:

  - You are about to drop the `payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_payment_provider` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `refund_request` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "task_type" ADD VALUE 'VERIFY_PAYMENT';
ALTER TYPE "task_type" ADD VALUE 'CHARGE_ATTENDANCE_PAYMENTS';

-- DropForeignKey
ALTER TABLE "payment" DROP CONSTRAINT "payment_productId_fkey";

-- DropForeignKey
ALTER TABLE "payment" DROP CONSTRAINT "payment_userId_fkey";

-- DropForeignKey
ALTER TABLE "product_payment_provider" DROP CONSTRAINT "product_payment_provider_productId_fkey";

-- DropForeignKey
ALTER TABLE "refund_request" DROP CONSTRAINT "refund_request_handledById_fkey";

-- DropForeignKey
ALTER TABLE "refund_request" DROP CONSTRAINT "refund_request_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "refund_request" DROP CONSTRAINT "refund_request_userId_fkey";

-- AlterTable
ALTER TABLE "attendance" ADD COLUMN     "attendancePrice" INTEGER;

-- AlterTable
ALTER TABLE "attendee" ADD COLUMN     "paymentChargedAt" TIMESTAMP(3),
ADD COLUMN     "paymentDeadline" TIMESTAMP(3),
ADD COLUMN     "paymentId" TEXT,
ADD COLUMN     "paymentLink" TEXT,
ADD COLUMN     "paymentRefundedAt" TIMESTAMP(3),
ADD COLUMN     "paymentRefundedById" TEXT,
ADD COLUMN     "paymentReservedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "payment";

-- DropTable
DROP TABLE "product";

-- DropTable
DROP TABLE "product_payment_provider";

-- DropTable
DROP TABLE "refund_request";

-- DropEnum
DROP TYPE "payment_provider";

-- DropEnum
DROP TYPE "payment_status";

-- DropEnum
DROP TYPE "product_type";

-- DropEnum
DROP TYPE "refund_request_status";

-- AddForeignKey
ALTER TABLE "attendee" ADD CONSTRAINT "attendee_paymentRefundedById_fkey" FOREIGN KEY ("paymentRefundedById") REFERENCES "ow_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
