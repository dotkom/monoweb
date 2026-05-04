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
CREATE TABLE "user_flag_link" (
    "id" TEXT NOT NULL,
    "awarded_at" TIMESTAMPTZ(3) NOT NULL,
    "reason" TEXT,
    "user_id" TEXT NOT NULL,
    "user_flag_id" TEXT NOT NULL,

    CONSTRAINT "user_flag_link_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_flag_name_key" ON "user_flag"("name");

-- AddForeignKey
ALTER TABLE "user_flag_link" ADD CONSTRAINT "user_flag_link_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_flag_link" ADD CONSTRAINT "user_flag_link_user_flag_id_fkey" FOREIGN KEY ("user_flag_id") REFERENCES "user_flag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
