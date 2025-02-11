/*
  Warnings:

  - Made the column `extras` on table `Attendance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `extrasChoices` on table `Attendee` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Attendance" ALTER COLUMN "extras" SET NOT NULL;

-- AlterTable
ALTER TABLE "Attendee" ALTER COLUMN "extrasChoices" SET NOT NULL;
