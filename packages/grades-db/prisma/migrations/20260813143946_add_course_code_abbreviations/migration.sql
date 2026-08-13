-- CreateTable
CREATE TABLE "course_code_abbreviation" (
    "abbreviation" TEXT NOT NULL,
    "course_id" TEXT NOT NULL
);

-- AddForeignKey
ALTER TABLE "course_code_abbreviation" ADD CONSTRAINT "course_code_abbreviation_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "course_code_abbreviation" ADD CONSTRAINT "course_code_abbreviation_pkey" PRIMARY KEY ("course_id", "abbreviation");
