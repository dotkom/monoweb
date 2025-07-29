/*
  Warnings:

  - The values [DATABASES_AND_SEARCH,SOFTWARE] on the enum `membership_specialization` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "membership_specialization_new" AS ENUM ('ARTIFICIAL_INTELLIGENCE', 'DATABASE_AND_SEARCH', 'INTERACTION_DESIGN', 'SOFTWARE_ENGINEERING', 'UNKNOWN');
ALTER TABLE "membership" ALTER COLUMN "specialization" DROP DEFAULT;
ALTER TABLE "membership" ALTER COLUMN "specialization" TYPE "membership_specialization_new" USING ("specialization"::text::"membership_specialization_new");
ALTER TYPE "membership_specialization" RENAME TO "membership_specialization_old";
ALTER TYPE "membership_specialization_new" RENAME TO "membership_specialization";
DROP TYPE "membership_specialization_old";
ALTER TABLE "membership" ALTER COLUMN "specialization" SET DEFAULT 'UNKNOWN';
COMMIT;
