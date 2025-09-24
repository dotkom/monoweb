-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "rowId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "operation" TEXT NOT NULL,
    "rowData" JSONB NOT NULL,
    "transactionId" TEXT,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ow_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
