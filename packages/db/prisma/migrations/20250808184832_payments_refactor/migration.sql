/*
  Warnings:

  - You are about to drop the `payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_payment_provider` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `refund_request` table. If the table is not empty, all the data it contains will be lost.

*/
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
ALTER TABLE "attendee" ADD COLUMN     "paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentDeadline" TIMESTAMP(3),
ADD COLUMN     "paymentLink" TEXT;

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
