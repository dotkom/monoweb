-- AlterEnum
ALTER TYPE "NotificationPayloadType" ADD VALUE 'INTEREST_GROUP_EVENT';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'NEW_INTEREST_GROUP_EVENT';
ALTER TYPE "NotificationType" ADD VALUE 'NEW_INTEREST_GROUP_EVENT_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'INTEREST_GROUP_EVENT_REQUEST_REVIEWED';
