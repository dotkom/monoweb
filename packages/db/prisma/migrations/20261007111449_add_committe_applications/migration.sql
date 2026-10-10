-- CreateEnum
CREATE TYPE "committee_application_interview_duration" AS ENUM ('MINUTES_20', 'MINUTES_30');

-- CreateEnum
CREATE TYPE "committee_application_group_type" AS ENUM ('EXCLUSIVE', 'ADDITIVE');

-- CreateTable
CREATE TABLE "committee_application_period" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "is_draft" BOOLEAN NOT NULL DEFAULT true,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "applications_open_at" TIMESTAMPTZ(3) NOT NULL,
    "applications_close_at" TIMESTAMPTZ(3) NOT NULL,
    "interviews_start_date" DATE NOT NULL,
    "interviews_end_date" DATE NOT NULL,
    "interviews_published_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "committee_application_period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committee_application_group" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interview_duration" "committee_application_interview_duration" NOT NULL,
    "type" "committee_application_group_type" NOT NULL,
    "group_id" TEXT NOT NULL,
    "application_period_id" TEXT NOT NULL,

    CONSTRAINT "committee_application_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committee_application" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "about_me" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "application_period_id" TEXT NOT NULL,

    CONSTRAINT "committee_application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committee_application_group_selection" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rank" INTEGER NOT NULL,
    "application_id" TEXT NOT NULL,
    "application_group_id" TEXT NOT NULL,
    "application_period_id" TEXT NOT NULL,

    CONSTRAINT "committee_application_group_selection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committee_application_availability" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "starts_at" TIMESTAMPTZ(3) NOT NULL,
    "ends_at" TIMESTAMPTZ(3) NOT NULL,
    "application_id" TEXT NOT NULL,

    CONSTRAINT "committee_application_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committee_application_interview_block" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "starts_at" TIMESTAMPTZ(3) NOT NULL,
    "ends_at" TIMESTAMPTZ(3) NOT NULL,
    "location_name" TEXT NOT NULL,
    "location_url" TEXT,
    "application_group_id" TEXT NOT NULL,

    CONSTRAINT "committee_application_interview_block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committee_application_interview" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "starts_at" TIMESTAMPTZ(3) NOT NULL,
    "ends_at" TIMESTAMPTZ(3) NOT NULL,
    "group_selection_id" TEXT NOT NULL,
    "application_group_id" TEXT NOT NULL,
    "interview_block_id" TEXT NOT NULL,

    CONSTRAINT "committee_application_interview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "committee_application_group_group_id_idx" ON "committee_application_group"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "committee_application_group_application_period_id_group_id_key" ON "committee_application_group"("application_period_id", "group_id");

-- CreateIndex
CREATE UNIQUE INDEX "committee_application_group_id_application_period_id_key" ON "committee_application_group"("id", "application_period_id");

-- CreateIndex
CREATE INDEX "committee_application_application_period_id_idx" ON "committee_application"("application_period_id");

-- CreateIndex
CREATE UNIQUE INDEX "committee_application_user_id_application_period_id_key" ON "committee_application"("user_id", "application_period_id");

-- CreateIndex
CREATE UNIQUE INDEX "committee_application_id_application_period_id_key" ON "committee_application"("id", "application_period_id");

-- CreateIndex
CREATE INDEX "committee_application_group_selection_application_group_id_idx" ON "committee_application_group_selection"("application_group_id");

-- CreateIndex
CREATE INDEX "committee_application_group_selection_application_period_id_idx" ON "committee_application_group_selection"("application_period_id");

-- CreateIndex
CREATE UNIQUE INDEX "committee_application_group_selection_application_id_rank_key" ON "committee_application_group_selection"("application_id", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "committee_application_group_selection_application_id_applic_key" ON "committee_application_group_selection"("application_id", "application_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "committee_application_group_selection_id_application_group__key" ON "committee_application_group_selection"("id", "application_group_id");

-- CreateIndex
CREATE INDEX "committee_application_availability_application_id_idx" ON "committee_application_availability"("application_id");

-- CreateIndex
CREATE INDEX "committee_application_interview_block_application_group_id_idx" ON "committee_application_interview_block"("application_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "committee_application_interview_block_id_application_group__key" ON "committee_application_interview_block"("id", "application_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "committee_application_interview_group_selection_id_key" ON "committee_application_interview"("group_selection_id");

-- CreateIndex
CREATE INDEX "committee_application_interview_application_group_id_idx" ON "committee_application_interview"("application_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "committee_application_interview_interview_block_id_starts_a_key" ON "committee_application_interview"("interview_block_id", "starts_at");

-- CreateIndex
CREATE UNIQUE INDEX "committee_application_interview_group_selection_id_applicat_key" ON "committee_application_interview"("group_selection_id", "application_group_id");

-- AddForeignKey
ALTER TABLE "committee_application_group" ADD CONSTRAINT "committee_application_group_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_application_group" ADD CONSTRAINT "committee_application_group_application_period_id_fkey" FOREIGN KEY ("application_period_id") REFERENCES "committee_application_period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_application" ADD CONSTRAINT "committee_application_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_application" ADD CONSTRAINT "committee_application_application_period_id_fkey" FOREIGN KEY ("application_period_id") REFERENCES "committee_application_period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_application_group_selection" ADD CONSTRAINT "committee_application_group_selection_application_id_appli_fkey" FOREIGN KEY ("application_id", "application_period_id") REFERENCES "committee_application"("id", "application_period_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_application_group_selection" ADD CONSTRAINT "committee_application_group_selection_application_group_id_fkey" FOREIGN KEY ("application_group_id", "application_period_id") REFERENCES "committee_application_group"("id", "application_period_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_application_availability" ADD CONSTRAINT "committee_application_availability_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "committee_application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_application_interview_block" ADD CONSTRAINT "committee_application_interview_block_application_group_id_fkey" FOREIGN KEY ("application_group_id") REFERENCES "committee_application_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_application_interview" ADD CONSTRAINT "committee_application_interview_group_selection_id_applica_fkey" FOREIGN KEY ("group_selection_id", "application_group_id") REFERENCES "committee_application_group_selection"("id", "application_group_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_application_interview" ADD CONSTRAINT "committee_application_interview_interview_block_id_applica_fkey" FOREIGN KEY ("interview_block_id", "application_group_id") REFERENCES "committee_application_interview_block"("id", "application_group_id") ON DELETE RESTRICT ON UPDATE CASCADE;
