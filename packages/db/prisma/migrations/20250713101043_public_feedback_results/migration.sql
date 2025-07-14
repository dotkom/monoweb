/*
  Warnings:

  - A unique constraint covering the columns `[publicResultsToken]` on the table `feedback_form` will be added. If there are existing duplicate values, this will fail.
  - The required column `publicResultsToken` was added to the `feedback_form` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "feedback_form" ADD COLUMN     "publicResultsToken" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "feedback_question" ADD COLUMN     "showInPublicResults" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "feedback_form_publicResultsToken_key" ON "feedback_form"("publicResultsToken");
