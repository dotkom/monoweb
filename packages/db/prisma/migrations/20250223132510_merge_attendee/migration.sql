/*
  Warnings:

  - You are about to drop the column `firstName` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the `waitlist_attendee` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `position` to the `attendee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reserved` to the `attendee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `waitlisted` to the `attendee` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "waitlist_attendee" DROP CONSTRAINT "waitlist_attendee_attendanceId_fkey";

-- DropForeignKey
ALTER TABLE "waitlist_attendee" DROP CONSTRAINT "waitlist_attendee_attendancePoolId_fkey";

-- DropForeignKey
ALTER TABLE "waitlist_attendee" DROP CONSTRAINT "waitlist_attendee_userId_fkey";

-- AlterTable
ALTER TABLE "attendee" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "name" TEXT,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "reserved" BOOLEAN NOT NULL,
ADD COLUMN     "waitlisted" BOOLEAN NOT NULL;

ALTER TABLE "attendee" ALTER COLUMN "position" DROP DEFAULT;

-- DropTable
DROP TABLE "waitlist_attendee";
