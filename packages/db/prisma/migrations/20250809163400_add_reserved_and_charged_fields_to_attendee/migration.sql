/*
  Warnings:

  - You are about to drop the column `paidAt` on the `attendee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "attendee" DROP COLUMN "paidAt",
ADD COLUMN     "paymentChargedAt" TIMESTAMP(3),
ADD COLUMN     "paymentReservedAt" TIMESTAMP(3);
