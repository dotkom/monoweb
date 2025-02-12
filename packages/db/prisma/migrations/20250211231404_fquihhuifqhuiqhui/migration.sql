/*
  Warnings:

  - Made the column `attendanceId` on table `WaitlistAttendee` required. This step will fail if there are existing NULL values in that column.
  - Made the column `attendancePoolId` on table `WaitlistAttendee` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "WaitlistAttendee" DROP CONSTRAINT "WaitlistAttendee_attendanceId_fkey";

-- DropForeignKey
ALTER TABLE "WaitlistAttendee" DROP CONSTRAINT "WaitlistAttendee_attendancePoolId_fkey";

-- AlterTable
ALTER TABLE "WaitlistAttendee" ALTER COLUMN "attendanceId" SET NOT NULL,
ALTER COLUMN "attendancePoolId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "WaitlistAttendee" ADD CONSTRAINT "WaitlistAttendee_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitlistAttendee" ADD CONSTRAINT "WaitlistAttendee_attendancePoolId_fkey" FOREIGN KEY ("attendancePoolId") REFERENCES "AttendancePool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
