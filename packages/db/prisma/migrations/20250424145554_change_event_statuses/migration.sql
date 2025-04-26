/*
  Warnings:

  - The values [TBA,NO_LIMIT,ATTENDANCE] on the enum `event_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
ALTER TABLE "event" DROP COLUMN "status";
DROP TYPE "event_status";
CREATE TYPE "event_status" AS ENUM ('DRAFT', 'PUBLIC', 'DELETED');
ALTER TABLE "event" ADD COLUMN "status" "event_status" DEFAULT 'PUBLIC' NOT NULL;
ALTER TABLE "event" ALTER COLUMN "status" DROP DEFAULT;
COMMIT;
