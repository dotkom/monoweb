ALTER TABLE "ow_user" ADD COLUMN     "workspaceUserId" TEXT;
CREATE UNIQUE INDEX "ow_user_workspaceUserId_key" ON "ow_user"("workspaceUserId");
ALTER TYPE "membership_type" ADD VALUE 'MAIL_AUDITOR';
