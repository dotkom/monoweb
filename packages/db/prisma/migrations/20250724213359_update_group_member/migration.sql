-- CreateTable
CREATE TABLE "group_member_role" (
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "group_member_role_pkey" PRIMARY KEY ("groupId","name")
);

-- AlterTable
ALTER TABLE "group" RENAME COLUMN "image" TO "imageUrl";
ALTER TABLE "interest_group" RENAME COLUMN "image" TO "imageUrl";
ALTER TABLE "company" RENAME COLUMN "image" TO "imageUrl";

-- AlterTable
ALTER TABLE "group" DROP COLUMN "longDescription",
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "contactUserId" TEXT,
ADD COLUMN     "link" TEXT,
ADD COLUMN     "leaderRoleName" TEXT NOT NULL DEFAULT 'Leder',
ADD COLUMN     "punisherRoleName" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_contactUserId_fkey" FOREIGN KEY ("contactUserId") REFERENCES "ow_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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

    CONSTRAINT "group_member_period_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "group_member_period" ADD CONSTRAINT "group_member_period_groupId_userId_fkey" FOREIGN KEY ("groupId", "userId") REFERENCES "group_member"("groupId", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "group_member_period_role" (
    "periodId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,

    CONSTRAINT "group_member_period_role_pkey" PRIMARY KEY ("periodId","groupId","roleName")
);

-- CreateIndex
CREATE UNIQUE INDEX "group_id_leaderRoleName_key" ON "group"("id", "leaderRoleName");

-- CreateIndex
CREATE UNIQUE INDEX "group_id_punisherRoleName_key" ON "group"("id", "punisherRoleName");

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_id_leaderRoleName_fkey" FOREIGN KEY ("id", "leaderRoleName") REFERENCES "group_member_role"("groupId", "name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_id_punisherRoleName_fkey" FOREIGN KEY ("id", "punisherRoleName") REFERENCES "group_member_role"("groupId", "name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_member_period_role" ADD CONSTRAINT "group_member_period_role_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "group_member_period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_member_period_role" ADD CONSTRAINT "group_member_period_role_groupId_roleName_fkey" FOREIGN KEY ("groupId", "roleName") REFERENCES "group_member_role"("groupId", "name") ON DELETE RESTRICT ON UPDATE CASCADE;
