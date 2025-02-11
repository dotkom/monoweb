/*
  Warnings:

  - Added the required column `type` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Mark` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('CONSULTING', 'RESEARCH', 'DEVELOPMENT', 'OTHER');

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "type",
ADD COLUMN     "type" "CompanyType" NOT NULL;

-- AlterTable
ALTER TABLE "Mark" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
