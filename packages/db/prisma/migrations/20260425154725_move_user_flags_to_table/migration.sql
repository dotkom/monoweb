/*
  Warnings:

  - You are about to drop the column `flags` on the `ow_user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ow_user" DROP COLUMN "flags";

-- CreateTable
CREATE TABLE "user_flag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "image_url" TEXT,

    CONSTRAINT "user_flag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserFlags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserFlags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_flag_name_key" ON "user_flag"("name");

-- CreateIndex
CREATE INDEX "_UserFlags_B_index" ON "_UserFlags"("B");

-- AddForeignKey
ALTER TABLE "_UserFlags" ADD CONSTRAINT "_UserFlags_A_fkey" FOREIGN KEY ("A") REFERENCES "ow_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFlags" ADD CONSTRAINT "_UserFlags_B_fkey" FOREIGN KEY ("B") REFERENCES "user_flag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
