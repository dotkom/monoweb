/*
  Warnings:

  - You are about to drop the column `category` on the `mark` table. All the data in the column will be lost.
  - Added the required column `groupSlug` to the `mark` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `mark` table without a default value. This is not possible if the table is not empty.
  - Added the required column `givenById` to the `personal_mark` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MarkType" AS ENUM ('MANUAL', 'LATE_ATTENDANCE', 'MISSED_ATTENDANCE');

-- AlterTable
ALTER TABLE "mark" DROP COLUMN "category",
ADD COLUMN     "groupSlug" TEXT NOT NULL,
ADD COLUMN     "type" "MarkType" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "weight" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "personal_mark" ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "givenById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "mark" ADD CONSTRAINT "mark_groupSlug_fkey" FOREIGN KEY ("groupSlug") REFERENCES "group"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_mark" ADD CONSTRAINT "personal_mark_givenById_fkey" FOREIGN KEY ("givenById") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
