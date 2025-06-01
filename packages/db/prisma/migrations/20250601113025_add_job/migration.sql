-- CreateEnum
CREATE TYPE "job_name" AS ENUM ('AttemptReserveAttendee');

-- CreateEnum
CREATE TYPE "job_status" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELED');

-- CreateTable
CREATE TABLE "job" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledAt" TIMESTAMPTZ(3) NOT NULL,
    "processedAt" TIMESTAMPTZ(3),
    "name" "job_name" NOT NULL,
    "status" "job_status" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB,

    CONSTRAINT "job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_job_scheduled_at_status" ON "job"("scheduledAt", "status");
