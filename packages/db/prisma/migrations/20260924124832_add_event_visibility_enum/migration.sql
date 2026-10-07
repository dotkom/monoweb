/*
  Warnings:

  - The values [INTERNAL] on the enum `event_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "event_visibility" AS ENUM ('PUBLIC', 'COMMITTEE_ONLY');

-- AlterTable
ALTER TABLE "event" ADD COLUMN     "visibility" "event_visibility" NOT NULL DEFAULT 'PUBLIC';

-- Migrate internal events to committee-only social events before removing the INTERNAL event type
UPDATE "event"
SET "visibility" = 'COMMITTEE_ONLY'
WHERE "type" = 'INTERNAL';

UPDATE "event"
SET "type" = 'SOCIAL'
WHERE "type" = 'INTERNAL';

-- AlterEnum
BEGIN;
CREATE TYPE "event_type_new" AS ENUM ('GENERAL_ASSEMBLY', 'COMPANY', 'ACADEMIC', 'SOCIAL', 'OTHER', 'WELCOME');
ALTER TABLE "event" ALTER COLUMN "type" TYPE "event_type_new" USING ("type"::text::"event_type_new");
ALTER TYPE "event_type" RENAME TO "event_type_old";
ALTER TYPE "event_type_new" RENAME TO "event_type";
DROP TYPE "public"."event_type_old";
COMMIT;
