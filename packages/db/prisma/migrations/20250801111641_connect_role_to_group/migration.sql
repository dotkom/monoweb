/*
  Warnings:

  - The primary key for the `group_membership_role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `groupId` on the `group_membership_role` table. All the data in the column will be lost.
  - You are about to drop the column `roleName` on the `group_membership_role` table. All the data in the column will be lost.
  - The primary key for the `group_role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[groupId,name]` on the table `group_role` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roleId` to the `group_membership_role` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `group_role` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "group_membership_role" DROP CONSTRAINT "group_membership_role_groupId_roleName_fkey";

-- AlterTable
ALTER TABLE "group_membership_role" DROP CONSTRAINT "group_membership_role_pkey",
DROP COLUMN "groupId",
DROP COLUMN "roleName",
ADD COLUMN     "roleId" TEXT NOT NULL,
ADD CONSTRAINT "group_membership_role_pkey" PRIMARY KEY ("membershipId", "roleId");

-- AlterTable
ALTER TABLE "group_role" DROP CONSTRAINT "group_role_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "group_role_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "group_role_groupId_name_key" ON "group_role"("groupId", "name");

-- AddForeignKey
ALTER TABLE "group_membership_role" ADD CONSTRAINT "group_membership_role_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "group_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_role" ADD CONSTRAINT "group_role_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
