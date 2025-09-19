/*
  Warnings:

  - Added the required column `transactionId` to the `audit_log` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "audit_log" DROP COLUMN "transactionId",
ADD COLUMN     "transactionId" BIGINT NOT NULL;
