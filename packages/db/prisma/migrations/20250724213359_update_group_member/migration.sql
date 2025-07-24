/*
  Warnings:

  - You are about to drop the column `longDescription` on the `group` table. All the data in the column will be lost.
  - The primary key for the `group_member` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `interest_group_member` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateEnum
CREATE TYPE "group_member_role" AS ENUM ('LEDER', 'NESTLEDER', 'OKONOMIANSVARLIG', 'TILLITSVALGT', 'VINSTRAFFANSVARLIG', 'MEDLEM');

-- AlterTable
ALTER TABLE "group" DROP COLUMN "longDescription",
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "shortDescription" TEXT;

-- AlterTable
ALTER TABLE "group_member" DROP CONSTRAINT "group_member_pkey",
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD CONSTRAINT "group_member_pkey" PRIMARY KEY ("groupId", "userId");

-- AlterTable
ALTER TABLE "interest_group_member" DROP CONSTRAINT "interest_group_member_pkey",
ADD CONSTRAINT "interest_group_member_pkey" PRIMARY KEY ("interestGroupId", "userId");

-- CreateTable
CREATE TABLE "group_member_period" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMPTZ(3),
    "roles" "group_member_role"[] NOT NULL DEFAULT ARRAY['MEDLEM']::"group_member_role"[],

    CONSTRAINT "group_member_period_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "group_member_period" ADD CONSTRAINT "group_member_period_groupId_userId_fkey" FOREIGN KEY ("groupId", "userId") REFERENCES "group_member"("groupId", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;
