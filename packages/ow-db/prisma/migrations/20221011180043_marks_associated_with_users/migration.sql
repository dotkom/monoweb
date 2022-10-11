/*
  Warnings:

  - The primary key for the `PersonalMarks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `PersonalMarks` table. All the data in the column will be lost.
  - Added the required column `userId` to the `PersonalMarks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PersonalMarks" DROP CONSTRAINT "PersonalMarks_pkey",
DROP COLUMN "id",
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "PersonalMarks_pkey" PRIMARY KEY ("userId");
