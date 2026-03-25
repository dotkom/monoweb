-- AlterTable
ALTER TABLE "course" ADD COLUMN     "faculty_id" TEXT;

-- CreateTable
CREATE TABLE "faculty" (
    "id" TEXT NOT NULL,
    "name_no" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "code" INTEGER NOT NULL,

    CONSTRAINT "faculty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "faculty_code_key" ON "faculty"("code");

-- AddForeignKey
ALTER TABLE "course" ADD CONSTRAINT "course_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;
