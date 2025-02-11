/*
  Warnings:

  - Made the column `yearCriteria` on table `AttendancePool` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AttendancePool" ALTER COLUMN "yearCriteria" SET NOT NULL;
