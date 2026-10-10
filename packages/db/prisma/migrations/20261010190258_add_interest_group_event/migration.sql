-- CreateEnum
CREATE TYPE "interest_group_event_status" AS ENUM ('IN_REVIEW', 'PUBLISHED', 'REJECTED', 'DELETED');

-- CreateTable
CREATE TABLE "interest_group_event" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start" TIMESTAMPTZ(3) NOT NULL,
    "end" TIMESTAMPTZ(3) NOT NULL,
    "register_end" TIMESTAMPTZ(3) NOT NULL,
    "deregister_deadline" TIMESTAMPTZ(3) NOT NULL,
    "image_url" TEXT NOT NULL,
    "location_title" TEXT,
    "location_address" TEXT,
    "location_link" TEXT,
    "status" "interest_group_event_status" NOT NULL,
    "interest_group_id" TEXT NOT NULL,

    CONSTRAINT "interest_group_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interest_group_event_registration" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "interest_group_event_id" TEXT NOT NULL,

    CONSTRAINT "interest_group_event_registration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interest_group_event_interest_group_id_idx" ON "interest_group_event"("interest_group_id");

-- CreateIndex
CREATE INDEX "interest_group_event_registration_interest_group_event_id_idx" ON "interest_group_event_registration"("interest_group_event_id");

-- CreateIndex
CREATE UNIQUE INDEX "interest_group_event_registration_user_id_interest_group_ev_key" ON "interest_group_event_registration"("user_id", "interest_group_event_id");

-- AddForeignKey
ALTER TABLE "interest_group_event" ADD CONSTRAINT "interest_group_event_interest_group_id_fkey" FOREIGN KEY ("interest_group_id") REFERENCES "group"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_group_event_registration" ADD CONSTRAINT "interest_group_event_registration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_group_event_registration" ADD CONSTRAINT "interest_group_event_registration_interest_group_event_id_fkey" FOREIGN KEY ("interest_group_event_id") REFERENCES "interest_group_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
