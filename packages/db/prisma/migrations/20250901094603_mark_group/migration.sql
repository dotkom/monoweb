/*
  Warnings:

  - You are about to drop the column `groupSlug` on the `mark` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "mark" DROP CONSTRAINT "mark_groupSlug_fkey";

-- AlterTable
ALTER TABLE "mark" DROP COLUMN "groupSlug";

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
