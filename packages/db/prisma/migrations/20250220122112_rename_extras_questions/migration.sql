/*
  Warnings:

  - You are about to drop the column `extras` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `extrasChoices` on the `attendee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "attendance" DROP COLUMN "extras",
ADD COLUMN     "questions" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "attendee" DROP COLUMN "extrasChoices",
ADD COLUMN     "questionResponses" JSONB NOT NULL DEFAULT '[]';
