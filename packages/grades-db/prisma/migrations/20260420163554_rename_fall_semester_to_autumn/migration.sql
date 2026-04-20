/*
  Warnings:

  - The values [FALL] on the enum `semester` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "semester_new" AS ENUM ('SPRING', 'SUMMER', 'AUTUMN');
ALTER TABLE "public"."course" ALTER COLUMN "taught_semesters" DROP DEFAULT;
ALTER TABLE "course" ALTER COLUMN "taught_semesters" TYPE "semester_new"[] USING ("taught_semesters"::text::"semester_new"[]);
ALTER TABLE "grade" ALTER COLUMN "semester" TYPE "semester_new" USING ("semester"::text::"semester_new");
ALTER TYPE "semester" RENAME TO "semester_old";
ALTER TYPE "semester_new" RENAME TO "semester";
DROP TYPE "public"."semester_old";
ALTER TABLE "course" ALTER COLUMN "taught_semesters" SET DEFAULT ARRAY[]::"semester"[];
COMMIT;
