-- CreateEnum
CREATE TYPE "group_member_visibility" AS ENUM ('ALL_MEMBERS', 'WITH_ROLES', 'LEADER', 'NONE');

-- AlterTable
ALTER TABLE "group" ADD COLUMN     "membersVisibility" "group_member_visibility" NOT NULL DEFAULT 'ALL_MEMBERS',
ADD COLUMN     "showLeaderAsContact" BOOLEAN NOT NULL DEFAULT false;
