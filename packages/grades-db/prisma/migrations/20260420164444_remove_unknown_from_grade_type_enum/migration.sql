/*
  Warnings:

  - The values [UNKNOWN] on the enum `grade_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "grade_type_new" AS ENUM ('PASS_FAIL', 'LETTER');
ALTER TABLE "course" ALTER COLUMN "grade_type" TYPE "grade_type_new" USING ("grade_type"::text::"grade_type_new");
ALTER TYPE "grade_type" RENAME TO "grade_type_old";
ALTER TYPE "grade_type_new" RENAME TO "grade_type";
DROP TYPE "public"."grade_type_old";
COMMIT;
