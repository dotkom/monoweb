/*
  Warnings:

  - You are about to drop the column `groupSlug` on the `mark` table. All the data in the column will be lost.
  - Added the required column `answerDeadline` to the `feedback_form` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "MarkType" ADD VALUE 'MISSING_FEEDBACK';

-- AlterEnum
ALTER TYPE "task_type" ADD VALUE 'VERIFY_FEEDBACK_ANSWERED';

-- DropForeignKey
ALTER TABLE "mark" DROP CONSTRAINT "mark_groupSlug_fkey";

-- DropForeignKey
ALTER TABLE "personal_mark" DROP CONSTRAINT "personal_mark_givenById_fkey";

-- AlterTable
ALTER TABLE "feedback_form" ADD COLUMN     "answerDeadline" TIMESTAMPTZ(3) NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '2 WEEKS');
ALTER TABLE "feedback_form" ALTER COLUMN   "answerDeadline" DROP DEFAULT;

-- AlterTable
ALTER TABLE "mark" DROP COLUMN "groupSlug";

-- AlterTable
ALTER TABLE "personal_mark" ALTER COLUMN "givenById" DROP NOT NULL;

-- CreateTable
CREATE TABLE "mark_group" (
    "markId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "mark_group_pkey" PRIMARY KEY ("markId","groupId")
);

-- AddForeignKey
ALTER TABLE "mark_group" ADD CONSTRAINT "mark_group_markId_fkey" FOREIGN KEY ("markId") REFERENCES "mark"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mark_group" ADD CONSTRAINT "mark_group_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_mark" ADD CONSTRAINT "personal_mark_givenById_fkey" FOREIGN KEY ("givenById") REFERENCES "ow_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
