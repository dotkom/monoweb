-- CreateEnum
CREATE TYPE "group_preferred_display_name" AS ENUM ('ABBREVIATION', 'NAME');

-- AlterTable
ALTER TABLE "group" ADD COLUMN "preferred_display_name" "group_preferred_display_name" NOT NULL DEFAULT 'ABBREVIATION';
