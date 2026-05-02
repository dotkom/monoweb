-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- DropIndex
DROP INDEX "course_name_en_idx";

-- DropIndex
DROP INDEX "course_name_no_idx";

-- CreateIndex
CREATE INDEX "course_name_no_idx" ON "course" USING GIN ("name_no" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "course_name_en_idx" ON "course" USING GIN ("name_en" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "course_code_idx" ON "course" USING GIN ("code" gin_trgm_ops);
