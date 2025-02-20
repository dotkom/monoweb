/*
  Warnings:

  - You are about to drop the column `questions` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `questionsChoices` on the `attendee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "attendance" DROP COLUMN "questions",
ADD COLUMN     "questions" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "attendee" DROP COLUMN "questionsChoices",
ADD COLUMN     "questionResponses" JSONB NOT NULL DEFAULT '[]';
