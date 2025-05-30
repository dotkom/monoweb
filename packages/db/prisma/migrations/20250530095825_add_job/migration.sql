-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cronExpression" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "handlerName" TEXT NOT NULL,
    "payload" JSONB,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);
