-- AlterEnum
BEGIN;
CREATE TYPE "grade_type_new" AS ENUM ('PASS_FAIL', 'LETTER');
ALTER TABLE "course" ALTER COLUMN "grade_type" TYPE "grade_type_new" USING ("grade_type"::text::"grade_type_new");
ALTER TYPE "grade_type" RENAME TO "grade_type_old";
ALTER TYPE "grade_type_new" RENAME TO "grade_type";
DROP TYPE "public"."grade_type_old";
COMMIT;

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

-- AlterTable
ALTER TABLE "department" ADD COLUMN     "faculty_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "course" RENAME COLUMN "oldest_year_checked_for_ntnu_data" TO "latest_year_checked_for_ntnu_data";
ALTER TABLE "course" RENAME COLUMN "student_count" TO "candidate_count";
ALTER TABLE "course" ALTER COLUMN "credits" DROP NOT NULL;

-- AlterTable
ALTER TABLE "grade" RENAME COLUMN "a" TO "gradeACount";
ALTER TABLE "grade" RENAME COLUMN "b" TO "gradeBCount";
ALTER TABLE "grade" RENAME COLUMN "c" TO "gradeCCount";
ALTER TABLE "grade" RENAME COLUMN "d" TO "gradeDCount";
ALTER TABLE "grade" RENAME COLUMN "e" TO "gradeECount";
ALTER TABLE "grade" RENAME COLUMN "failed" TO "gradeFCount";
ALTER TABLE "grade" RENAME COLUMN "passed" TO "passedCount";
ALTER TABLE "grade" ADD COLUMN "failedCount" INTEGER NOT NULL;
ALTER TABLE "grade" DROP COLUMN "average_grade";
ALTER TABLE "grade" DROP COLUMN "is_digital_exam";