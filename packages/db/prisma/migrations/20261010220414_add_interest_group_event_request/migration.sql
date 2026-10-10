-- CreateTable
CREATE TABLE "interest_group_event_request" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "description" TEXT,
    "requested_amount" INTEGER NOT NULL,
    "expected_attendee_count" INTEGER NOT NULL,
    "approved_amount" INTEGER,
    "reviewed_at" TIMESTAMPTZ(3),
    "review_note" TEXT,
    "interest_group_event_id" TEXT NOT NULL,
    "requested_by_id" TEXT NOT NULL,
    "reviewed_by_id" TEXT,

    CONSTRAINT "interest_group_event_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interest_group_event_request_interest_group_event_id_key" ON "interest_group_event_request"("interest_group_event_id");

-- CreateIndex
CREATE INDEX "interest_group_event_request_requested_by_id_idx" ON "interest_group_event_request"("requested_by_id");

-- CreateIndex
CREATE INDEX "interest_group_event_request_reviewed_by_id_idx" ON "interest_group_event_request"("reviewed_by_id");

-- AddForeignKey
ALTER TABLE "interest_group_event_request" ADD CONSTRAINT "interest_group_event_request_interest_group_event_id_fkey" FOREIGN KEY ("interest_group_event_id") REFERENCES "interest_group_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_group_event_request" ADD CONSTRAINT "interest_group_event_request_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_group_event_request" ADD CONSTRAINT "interest_group_event_request_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "ow_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
