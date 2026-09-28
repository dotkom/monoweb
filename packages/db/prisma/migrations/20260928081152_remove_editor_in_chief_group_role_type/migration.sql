/*
  Warnings:

  - The values [EDITOR_IN_CHIEF] on the enum `group_role_type` will be removed. If these variants are still used in the database, this will fail.

*/


BEGIN;

UPDATE "group_role" SET "type" = 'COSMETIC' WHERE "type" = 'EDITOR_IN_CHIEF';

-- AlterEnum
CREATE TYPE "group_role_type_new" AS ENUM ('LEADER', 'PUNISHER', 'TREASURER', 'COSMETIC', 'DEPUTY_LEADER', 'TRUSTEE', 'EMAIL_ONLY', 'TEMPORARILY_LEAVE');
ALTER TABLE "public"."group_role" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "group_role" ALTER COLUMN "type" TYPE "group_role_type_new" USING ("type"::text::"group_role_type_new");
ALTER TYPE "group_role_type" RENAME TO "group_role_type_old";
ALTER TYPE "group_role_type_new" RENAME TO "group_role_type";
DROP TYPE "public"."group_role_type_old";
ALTER TABLE "group_role" ALTER COLUMN "type" SET DEFAULT 'COSMETIC';

COMMIT;
