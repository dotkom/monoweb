-- CreateEnum
CREATE TYPE "UserFlag" AS ENUM ('VANITY_VERIFIED');

-- AlterTable
ALTER TABLE "ow_user" ADD COLUMN     "flags" "UserFlag"[];
