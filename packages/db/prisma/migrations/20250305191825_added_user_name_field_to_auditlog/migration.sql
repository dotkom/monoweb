/*
  Warnings:

  - Added the required column `userName` to the `auditlog` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `action` on the `auditlog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "action" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- AlterTable
ALTER TABLE "auditlog" ADD COLUMN     "userName" TEXT NOT NULL,
DROP COLUMN "action",
ADD COLUMN     "action" "action" NOT NULL;
