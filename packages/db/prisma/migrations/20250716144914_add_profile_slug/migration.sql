/*
  Warnings:

  - A unique constraint covering the columns `[profileSlug]` on the table `ow_user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ow_user" ADD COLUMN     "profileSlug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ow_user_profileSlug_key" ON "ow_user"("profileSlug");
