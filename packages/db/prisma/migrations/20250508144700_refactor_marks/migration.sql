/*
  Warnings:

  - You are about to drop the column `category` on the `mark` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `mark` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `mark` table. All the data in the column will be lost.
  - Added the required column `amount` to the `mark` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `mark` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "mark" DROP COLUMN "category",
DROP COLUMN "details",
DROP COLUMN "duration",
ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;
