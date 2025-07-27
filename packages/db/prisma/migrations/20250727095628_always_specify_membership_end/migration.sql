/*
  Warnings:

  - Made the column `end` on table `membership` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "membership" ALTER COLUMN "end" SET NOT NULL;
