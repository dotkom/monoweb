/*
  Warnings:

  - A unique constraint covering the columns `[group_id,user_id]` on the table `group_membership` will be added for rows where `end` is null. If there are existing duplicate active memberships, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "group_membership_one_active" ON "group_membership"("group_id", "user_id") WHERE "end" IS NULL;
