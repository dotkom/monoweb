-- CreateEnum
CREATE TYPE "semester" AS ENUM ('SPRING', 'SUMMER', 'FALL');

-- CreateTable
CREATE TABLE "Grade" (
    "id" SERIAL NOT NULL,
    "average_grade" DOUBLE PRECISION NOT NULL,
    "passed" INTEGER NOT NULL,
    "a" INTEGER NOT NULL,
    "b" INTEGER NOT NULL,
    "c" INTEGER NOT NULL,
    "d" INTEGER NOT NULL,
    "e" INTEGER NOT NULL,
    "failed" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "is_digital_exam" BOOLEAN NOT NULL,
    "semester" "semester" NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
