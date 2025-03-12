/*
  Warnings:

  - You are about to drop the column `changes` on the `auditlog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "auditlog" DROP COLUMN "changes";
