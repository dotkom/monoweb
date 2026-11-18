-- AlterEnum
ALTER TYPE "NotificationPayloadType" ADD VALUE 'SIDEQUEST';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'NEW_SIDEQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'NEW_SIDEQUEST_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'SIDEQUEST_REQUEST_REVIEWED';
