-- CreateTable
CREATE TABLE "auditlog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "changes" JSONB,

    CONSTRAINT "auditlog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "auditlog" ADD CONSTRAINT "auditlog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
