-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "cronExpression" TEXT NOT NULL,
    "payload" JSONB,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);
