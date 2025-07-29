/*
  Warnings:

  - You are about to drop the `event_interest_group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `interest_group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `interest_group_member` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "group_type" ADD VALUE 'INTEREST_GROUP';

-- DropForeignKey
ALTER TABLE "event_interest_group" DROP CONSTRAINT "event_interest_group_eventId_fkey";

-- DropForeignKey
ALTER TABLE "event_interest_group" DROP CONSTRAINT "event_interest_group_interestGroupId_fkey";

-- DropForeignKey
ALTER TABLE "interest_group_member" DROP CONSTRAINT "interest_group_member_interestGroupId_fkey";

-- DropForeignKey
ALTER TABLE "interest_group_member" DROP CONSTRAINT "interest_group_member_userId_fkey";

-- AlterTable
ALTER TABLE "group" ADD COLUMN     "deactivatedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "event_interest_group";

-- DropTable
DROP TABLE "interest_group";

-- DropTable
DROP TABLE "interest_group_member";
