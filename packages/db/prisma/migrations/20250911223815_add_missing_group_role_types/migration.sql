-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.

BEGIN;

ALTER TYPE "group_role_type" ADD VALUE 'TREASURER';
ALTER TYPE "group_role_type" ADD VALUE 'DEPUTY_LEADER';
ALTER TYPE "group_role_type" ADD VALUE 'TRUSTEE';
ALTER TYPE "group_role_type" ADD VALUE 'EMAIL_ONLY';

COMMIT;

-- Manually update types of existing roles
UPDATE group_role SET "type" = 'DEPUTY_LEADER' WHERE "name" = 'Nestleder';
UPDATE group_role SET "type" = 'TREASURER' WHERE "name" = 'Økonomiansvarlig';
UPDATE group_role SET "type" = 'TRUSTEE' WHERE "name" = 'Tillitsvalgt';