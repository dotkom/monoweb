-- AlterTable
ALTER TABLE "grade_distribution" RENAME COLUMN "gradeACount" TO "grade_a_count";
ALTER TABLE "grade_distribution" RENAME COLUMN "gradeBCount" TO "grade_b_count";
ALTER TABLE "grade_distribution" RENAME COLUMN "gradeCCount" TO "grade_c_count";
ALTER TABLE "grade_distribution" RENAME COLUMN "gradeDCount" TO "grade_d_count";
ALTER TABLE "grade_distribution" RENAME COLUMN "gradeECount" TO "grade_e_count";
ALTER TABLE "grade_distribution" RENAME COLUMN "gradeFCount" TO "grade_f_count";
ALTER TABLE "grade_distribution" RENAME COLUMN "passedCount" TO "passed_count";
ALTER TABLE "grade_distribution" RENAME COLUMN "failedCount" TO "failed_count";

-- CreateIndex
CREATE INDEX "course_faculty_id_idx" ON "course"("faculty_id");

-- CreateIndex
CREATE INDEX "course_department_id_idx" ON "course"("department_id");

-- CreateIndex
CREATE INDEX "department_faculty_id_idx" ON "department"("faculty_id");

-- CreateIndex
CREATE INDEX "credit_reduction_overlap_course_id_idx" ON "credit_reduction"("overlap_course_id");
