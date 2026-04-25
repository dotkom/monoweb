DROP INDEX "course_english_name_idx";
DROP INDEX "course_norwegian_name_idx";

ALTER TABLE "course" RENAME COLUMN "content" TO "content_no";
ALTER TABLE "course" RENAME COLUMN "english_name" TO "name_en";
ALTER TABLE "course" RENAME COLUMN "exam_type" TO "exam_type_no";
ALTER TABLE "course" RENAME COLUMN "learning_outcomes" TO "learning_outcomes_no";
ALTER TABLE "course" RENAME COLUMN "norwegian_name" TO "name_no";
ALTER TABLE "course" RENAME COLUMN "teaching_methods" TO "teaching_methods_no";

ALTER TABLE "course" ADD COLUMN "content_en" TEXT;
ALTER TABLE "course" ADD COLUMN "exam_type_en" TEXT;
ALTER TABLE "course" ADD COLUMN "learning_outcomes_en" TEXT;
ALTER TABLE "course" ADD COLUMN "teaching_methods_en" TEXT;

CREATE INDEX "course_name_no_idx" ON "course"("name_no");
CREATE INDEX "course_name_en_idx" ON "course"("name_en");
