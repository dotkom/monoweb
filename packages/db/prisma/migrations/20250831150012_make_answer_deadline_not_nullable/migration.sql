/*
  Warnings:

  - Made the column `answerDeadline` on table `feedback_form` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "feedback_form" ALTER COLUMN "answerDeadline" SET NOT NULL;
