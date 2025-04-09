/*
  Warnings:

  - You are about to drop the column `isVisible` on the `attendance_pool` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `attendance_pool` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the column `registeredAt` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the column `selectionResponses` on the `attendee` table. All the data in the column will be lost.
  - You are about to drop the column `waitlisted` on the `attendee` table. All the data in the column will be lost.
  - Added the required column `displayName` to the `attendee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reserveTime` to the `attendee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attendance_pool" DROP COLUMN "isVisible",
DROP COLUMN "type",
ADD COLUMN     "mergeDelayHours" INTEGER;

-- AlterTable
ALTER TABLE "attendee" DROP COLUMN "name",
DROP COLUMN "position",
DROP COLUMN "registeredAt",
DROP COLUMN "selectionResponses",
DROP COLUMN "waitlisted",
ADD COLUMN     "displayName" TEXT NOT NULL,
ADD COLUMN     "reserveTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "selections" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "userGrade" INTEGER;
