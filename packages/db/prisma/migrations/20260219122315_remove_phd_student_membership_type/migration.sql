/*
  Warnings:

  - The values [PHD_STUDENT] on the enum `membership_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "membership_type_new" AS ENUM ('BACHELOR_STUDENT', 'MASTER_STUDENT', 'KNIGHT', 'SOCIAL_MEMBER');
ALTER TABLE "membership" ALTER COLUMN "type" TYPE "membership_type_new" USING ("type"::text::"membership_type_new");
ALTER TYPE "membership_type" RENAME TO "membership_type_old";
ALTER TYPE "membership_type_new" RENAME TO "membership_type";
DROP TYPE "public"."membership_type_old";
COMMIT;
