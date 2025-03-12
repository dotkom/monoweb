-- CreateTable
CREATE TABLE "group_member" (
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "group_member_pkey" PRIMARY KEY ("groupId")
);

-- AddForeignKey
ALTER TABLE "group_member" ADD CONSTRAINT "group_member_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_member" ADD CONSTRAINT "group_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
