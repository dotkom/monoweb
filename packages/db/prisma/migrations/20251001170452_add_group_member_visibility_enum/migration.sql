-- CreateEnum
CREATE TYPE "group_member_visibility" AS ENUM ('ALL_MEMBERS', 'WITH_ROLES', 'LEADER', 'NONE');

-- AlterTable
ALTER TABLE "group" ADD COLUMN     "showMembers" "group_member_visibility" NOT NULL DEFAULT 'ALL_MEMBERS';
