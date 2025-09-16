-- AlterTable
ALTER TABLE "task" ADD COLUMN     "recurringTaskId" TEXT;

-- CreateTable
CREATE TABLE "recurring_task" (
    "id" TEXT NOT NULL,
    "type" "task_type" NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "schedule" TEXT NOT NULL,
    "lastRunAt" TIMESTAMPTZ(3),
    "nextRunAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "recurring_task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recurring_task_nextRunAt_idx" ON "recurring_task"("nextRunAt");

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_recurringTaskId_fkey" FOREIGN KEY ("recurringTaskId") REFERENCES "recurring_task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
