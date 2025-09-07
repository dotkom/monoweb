ALTER TABLE "ow_user" ADD COLUMN     "workspaceUserId" TEXT;
CREATE UNIQUE INDEX "ow_user_workspaceUserId_key" ON "ow_user"("workspaceUserId");
ALTER TABLE "group" ADD COLUMN     "workspaceGroupId" TEXT;
CREATE UNIQUE INDEX "group_workspaceGroupId_key" ON "group"("workspaceGroupId");
ALTER TYPE "membership_type" ADD VALUE 'MAIL_AUDITOR';
