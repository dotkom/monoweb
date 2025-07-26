/*
  Warnings:

  - The values [BEDPRES] on the enum `event_type` will be removed. If these variants are still used in the database, this will fail.
  - The values [NODECOMMITTEE,OTHERGROUP] on the enum `group_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `reserveTime` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `company` table. All the data in the column will be lost.
  - You are about to drop the column `public` on the `event` table. All the data in the column will be lost.
  - The primary key for the `group` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `contactUserId` on the `group` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `group` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `group` table. All the data in the column will be lost.
  - You are about to drop the column `leaderRoleName` on the `group` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `group` table. All the data in the column will be lost.
  - You are about to drop the column `punisherRoleName` on the `group` table. All the data in the column will be lost.
  - You are about to drop the column `shortDescription` on the `group` table. All the data in the column will be lost.
  - You are about to drop the column `ingress` on the `job_listing` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `offline` table. All the data in the column will be lost.
  - You are about to drop the `group_member` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `group_member_period` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `group_member_period_role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `group_member_role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `job` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `group` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `earliestReservationAt` to the `attendee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `abbreviation` to the `group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `about` to the `group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `about` to the `job_listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `job_listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publishedAt` to the `offline` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "group_role_type" AS ENUM ('LEADER', 'PUNISHER', 'COSMETIC');

-- CreateEnum
CREATE TYPE "task_type" AS ENUM ('ATTEMPT_RESERVE_ATTENDEE', 'MERGE_POOLS');

-- CreateEnum
CREATE TYPE "task_status" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELED');

-- AlterEnum
BEGIN;
CREATE TYPE "event_type_new" AS ENUM ('SOCIAL', 'ACADEMIC', 'COMPANY', 'GENERAL_ASSEMBLY', 'INTERNAL', 'OTHER');
ALTER TABLE "event" ALTER COLUMN "type" TYPE "event_type_new" USING ("type"::text::"event_type_new");
ALTER TYPE "event_type" RENAME TO "event_type_old";
ALTER TYPE "event_type_new" RENAME TO "event_type";
DROP TYPE "event_type_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "group_type_new" AS ENUM ('COMMITTEE', 'NODE_COMMITTEE', 'ASSOCIATED');
ALTER TABLE "group" ALTER COLUMN "type" TYPE "group_type_new" USING ("type"::text::"group_type_new");
ALTER TYPE "group_type" RENAME TO "group_type_old";
ALTER TYPE "group_type_new" RENAME TO "group_type";
DROP TYPE "group_type_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "event_hosting_group" DROP CONSTRAINT "event_hosting_group_groupId_fkey";

-- DropForeignKey
ALTER TABLE "group" DROP CONSTRAINT "group_contactUserId_fkey";

-- DropForeignKey
ALTER TABLE "group" DROP CONSTRAINT "group_id_leaderRoleName_fkey";

-- DropForeignKey
ALTER TABLE "group" DROP CONSTRAINT "group_id_punisherRoleName_fkey";

-- DropForeignKey
ALTER TABLE "group_member" DROP CONSTRAINT "group_member_groupId_fkey";

-- DropForeignKey
ALTER TABLE "group_member" DROP CONSTRAINT "group_member_userId_fkey";

-- DropForeignKey
ALTER TABLE "group_member_period" DROP CONSTRAINT "group_member_period_groupId_userId_fkey";

-- DropForeignKey
ALTER TABLE "group_member_period_role" DROP CONSTRAINT "group_member_period_role_groupId_roleName_fkey";

-- DropForeignKey
ALTER TABLE "group_member_period_role" DROP CONSTRAINT "group_member_period_role_periodId_fkey";

-- DropIndex
DROP INDEX "group_id_key";

-- DropIndex
DROP INDEX "group_id_leaderRoleName_key";

-- DropIndex
DROP INDEX "group_id_punisherRoleName_key";

-- AlterTable
ALTER TABLE "attendee" DROP COLUMN "reserveTime",
ADD COLUMN     "earliestReservationAt" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "company" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "event" DROP COLUMN "public";

-- AlterTable
ALTER TABLE "group" DROP CONSTRAINT "group_pkey",
DROP COLUMN "contactUserId",
DROP COLUMN "fullName",
DROP COLUMN "id",
DROP COLUMN "leaderRoleName",
DROP COLUMN "link",
DROP COLUMN "punisherRoleName",
DROP COLUMN "shortDescription",
ADD COLUMN     "abbreviation" TEXT NOT NULL,
ADD COLUMN     "about" TEXT NOT NULL,
ADD COLUMN     "contactUrl" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ADD CONSTRAINT "group_pkey" PRIMARY KEY ("slug");

-- AlterTable
ALTER TABLE "job_listing" DROP COLUMN "ingress",
ADD COLUMN     "about" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "offline" DROP COLUMN "published",
ADD COLUMN     "publishedAt" TIMESTAMPTZ(3) NOT NULL;

-- DropTable
DROP TABLE "group_member";

-- DropTable
DROP TABLE "group_member_period";

-- DropTable
DROP TABLE "group_member_period_role";

-- DropTable
DROP TABLE "group_member_role";

-- DropTable
DROP TABLE "job";

-- DropEnum
DROP TYPE "company_type";

-- DropEnum
DROP TYPE "job_name";

-- DropEnum
DROP TYPE "job_status";

-- CreateTable
CREATE TABLE "group_membership" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "start" TIMESTAMPTZ(3) NOT NULL,
    "end" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_membership_role" (
    "membershipId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,

    CONSTRAINT "group_membership_role_pkey" PRIMARY KEY ("membershipId","groupId","roleName")
);

-- CreateTable
CREATE TABLE "group_role" (
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "group_role_type" NOT NULL DEFAULT 'COSMETIC',

    CONSTRAINT "group_role_pkey" PRIMARY KEY ("groupId","name")
);

-- CreateTable
CREATE TABLE "task" (
    "id" TEXT NOT NULL,
    "type" "task_type" NOT NULL,
    "status" "task_status" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledAt" TIMESTAMPTZ(3) NOT NULL,
    "processedAt" TIMESTAMPTZ(3),

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_job_scheduled_at_status" ON "task"("scheduledAt", "status");

-- CreateIndex
CREATE UNIQUE INDEX "group_slug_key" ON "group"("slug");

-- AddForeignKey
ALTER TABLE "group_membership" ADD CONSTRAINT "group_membership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_membership" ADD CONSTRAINT "group_membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_membership_role" ADD CONSTRAINT "group_membership_role_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "group_membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_membership_role" ADD CONSTRAINT "group_membership_role_groupId_roleName_fkey" FOREIGN KEY ("groupId", "roleName") REFERENCES "group_role"("groupId", "name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_hosting_group" ADD CONSTRAINT "event_hosting_group_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
