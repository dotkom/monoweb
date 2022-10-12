/*
  Warnings:

  - Made the column `description` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `website` on table `Company` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "type" TEXT,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "website" SET NOT NULL;
