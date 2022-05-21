/*
  Warnings:

  - You are about to drop the column `end_date` on the `Punishment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Punishment" DROP COLUMN "end_date",
ADD COLUMN     "given_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
