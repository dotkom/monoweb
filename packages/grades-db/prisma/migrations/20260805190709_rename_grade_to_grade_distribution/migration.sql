ALTER TABLE "grade" RENAME TO "grade_distribution";

ALTER INDEX "grade_pkey" RENAME TO "grade_distribution_pkey";
ALTER INDEX "grade_course_id_idx" RENAME TO "grade_distribution_course_id_idx";
ALTER INDEX "grade_course_id_semester_year_key" RENAME TO "grade_distribution_course_id_semester_year_key";

ALTER TABLE "grade_distribution" RENAME CONSTRAINT "grade_course_id_fkey" TO "grade_distribution_course_id_fkey";