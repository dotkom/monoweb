-- CreateEnum
CREATE TYPE "membership_specialization" AS ENUM ('ARTIFICIAL_INTELLIGENCE', 'DATABASES_AND_SEARCH', 'INTERACTION_DESIGN', 'SOFTWARE', 'UNKNOWN');

-- AlterTable
ALTER TABLE "membership" ADD COLUMN     "specialization" "membership_specialization" DEFAULT 'UNKNOWN';
