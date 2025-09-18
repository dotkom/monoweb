-- DropForeignKey
ALTER TABLE "group_membership" DROP CONSTRAINT "group_membership_groupId_fkey";

-- DropForeignKey
ALTER TABLE "group_membership" DROP CONSTRAINT "group_membership_userId_fkey";

-- DropForeignKey
ALTER TABLE "group_membership_role" DROP CONSTRAINT "group_membership_role_membershipId_fkey";

-- DropForeignKey
ALTER TABLE "group_membership_role" DROP CONSTRAINT "group_membership_role_roleId_fkey";

-- DropForeignKey
ALTER TABLE "group_role" DROP CONSTRAINT "group_role_groupId_fkey";

-- AddForeignKey
ALTER TABLE "group_membership" ADD CONSTRAINT "group_membership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_membership" ADD CONSTRAINT "group_membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ow_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_membership_role" ADD CONSTRAINT "group_membership_role_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "group_membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_membership_role" ADD CONSTRAINT "group_membership_role_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "group_role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_role" ADD CONSTRAINT "group_role_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
