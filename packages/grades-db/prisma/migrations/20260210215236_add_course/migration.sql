/*
  Warnings:

  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Grade` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "study_level" AS ENUM ('FOUNDATION', 'INTERMEDIATE', 'BACHELOR_ADVANCED', 'MASTER', 'PHD', 'CONTINUING_EDUCATION', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "grade_type" AS ENUM ('PASS_FAIL', 'LETTER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "campus" AS ENUM ('TRONDHEIM', 'GJOVIK', 'ALESUND');

-- CreateEnum
CREATE TYPE "teaching_language" AS ENUM ('NORWEGIAN', 'ENGLISH');

-- DropForeignKey
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_course_id_fkey";

-- DropTable
DROP TABLE "Course";

-- DropTable
DROP TABLE "Grade";

-- CreateTable
CREATE TABLE "course" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "norwegian_name" TEXT NOT NULL,
    "english_name" TEXT,
    "credits" DOUBLE PRECISION NOT NULL,
    "study_level" "study_level" NOT NULL,
    "grade_type" "grade_type" NOT NULL,
    "first_year_taught" INTEGER NOT NULL,
    "last_year_taught" INTEGER,
    "content" TEXT,
    "teaching_methods" TEXT,
    "learning_outcomes" TEXT,
    "exam_type" TEXT,
    "student_count" INTEGER NOT NULL,
    "average_grade" DOUBLE PRECISION NOT NULL,
    "pass_rate" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taught_semesters" "semester"[] DEFAULT ARRAY[]::"semester"[],
    "teaching_languages" "teaching_language"[] DEFAULT ARRAY[]::"teaching_language"[],
    "campuses" "campus"[] DEFAULT ARRAY[]::"campus"[],

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade" (
    "id" TEXT NOT NULL,
    "average_grade" DOUBLE PRECISION NOT NULL,
    "passed" INTEGER NOT NULL,
    "a" INTEGER NOT NULL,
    "b" INTEGER NOT NULL,
    "c" INTEGER NOT NULL,
    "d" INTEGER NOT NULL,
    "e" INTEGER NOT NULL,
    "failed" INTEGER NOT NULL,
    "course_id" TEXT NOT NULL,
    "is_digital_exam" BOOLEAN NOT NULL,
    "semester" "semester" NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "course_code_key" ON "course"("code");

-- CreateIndex
CREATE INDEX "course_norwegian_name_idx" ON "course"("norwegian_name");

-- CreateIndex
CREATE INDEX "course_english_name_idx" ON "course"("english_name");

-- CreateIndex
CREATE INDEX "grade_course_id_idx" ON "grade"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "grade_course_id_semester_year_key" ON "grade"("course_id", "semester", "year");

-- AddForeignKey
ALTER TABLE "grade" ADD CONSTRAINT "grade_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
