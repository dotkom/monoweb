-- CreateEnum
CREATE TYPE "InterviewLength" AS ENUM ('THIRTY_MINUTES', 'TWENTY_MINUTES', 'FIFTEEN_MINUTES');

-- CreateEnum
CREATE TYPE "ApplicationExtraInterest" AS ENUM ('REALFAGSKJELLERER', 'FEMINIT', 'DOTDAGENE');

-- CreateTable
CREATE TABLE "application_period" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMPTZ(3) NOT NULL,
    "end_date" TIMESTAMPTZ(3) NOT NULL,
    "interview_start_date" TIMESTAMPTZ(3) NOT NULL,
    "interview_end_date" TIMESTAMPTZ(3) NOT NULL,
    "is_draft" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "application_period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_period_group" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "group_id" TEXT NOT NULL,
    "application_period_id" TEXT NOT NULL,
    "interview_length" "InterviewLength" NOT NULL,

    CONSTRAINT "application_period_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "application_period_id" TEXT NOT NULL,
    "about_me" TEXT,
    "is_interested_in_being_treasurer" BOOLEAN NOT NULL DEFAULT false,
    "extraInterest" "ApplicationExtraInterest"[],

    CONSTRAINT "application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_preference" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rank" INTEGER NOT NULL,
    "application_id" TEXT NOT NULL,
    "application_period_group_id" TEXT NOT NULL,

    CONSTRAINT "application_preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_availability" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "start" TIMESTAMPTZ(3) NOT NULL,
    "end" TIMESTAMPTZ(3) NOT NULL,
    "application_id" TEXT NOT NULL,

    CONSTRAINT "application_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_interview" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "start" TIMESTAMPTZ(3) NOT NULL,
    "end" TIMESTAMPTZ(3) NOT NULL,
    "application_preference_id" TEXT NOT NULL,
    "booked_room_id" TEXT NOT NULL,

    CONSTRAINT "scheduled_interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booked_room" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "start_time" TIMESTAMPTZ(3) NOT NULL,
    "end_time" TIMESTAMPTZ(3) NOT NULL,
    "name" TEXT NOT NULL,
    "mazemap_link" TEXT,
    "application_period_group_id" TEXT NOT NULL,

    CONSTRAINT "booked_room_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "application_period_group_application_period_id_group_id_key" ON "application_period_group"("application_period_id", "group_id");

-- CreateIndex
CREATE UNIQUE INDEX "application_user_id_application_period_id_key" ON "application"("user_id", "application_period_id");

-- CreateIndex
CREATE UNIQUE INDEX "application_preference_application_id_rank_key" ON "application_preference"("application_id", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "application_preference_application_id_application_period_gr_key" ON "application_preference"("application_id", "application_period_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "scheduled_interview_application_preference_id_key" ON "scheduled_interview"("application_preference_id");

-- AddForeignKey
ALTER TABLE "application_period_group" ADD CONSTRAINT "application_period_group_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_period_group" ADD CONSTRAINT "application_period_group_application_period_id_fkey" FOREIGN KEY ("application_period_id") REFERENCES "application_period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_application_period_id_fkey" FOREIGN KEY ("application_period_id") REFERENCES "application_period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_preference" ADD CONSTRAINT "application_preference_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_preference" ADD CONSTRAINT "application_preference_application_period_group_id_fkey" FOREIGN KEY ("application_period_group_id") REFERENCES "application_period_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_availability" ADD CONSTRAINT "application_availability_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_interview" ADD CONSTRAINT "scheduled_interview_application_preference_id_fkey" FOREIGN KEY ("application_preference_id") REFERENCES "application_preference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_interview" ADD CONSTRAINT "scheduled_interview_booked_room_id_fkey" FOREIGN KEY ("booked_room_id") REFERENCES "booked_room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booked_room" ADD CONSTRAINT "booked_room_application_period_group_id_fkey" FOREIGN KEY ("application_period_group_id") REFERENCES "application_period_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
