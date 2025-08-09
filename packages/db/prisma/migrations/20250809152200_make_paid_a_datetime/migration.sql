/*
  Warnings:

  - You are about to drop the column `paid` on the `attendee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "attendee" DROP COLUMN "paid",
ADD COLUMN     "paidAt" TIMESTAMP(3);
