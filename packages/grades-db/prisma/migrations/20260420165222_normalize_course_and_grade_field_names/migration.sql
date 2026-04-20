ALTER TABLE "course" RENAME COLUMN "oldest_year_checked_for_ntnu_data" TO "latest_year_checked_for_ntnu_data";
ALTER TABLE "course" RENAME COLUMN "student_count" TO "candidate_count";

ALTER TABLE "course" ALTER COLUMN "credits" DROP NOT NULL;

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
