ALTER TABLE "committee_application_group_selection"
ADD COLUMN "notes" TEXT NOT NULL DEFAULT '';

CREATE TABLE "committee_application_interview_attendee" (
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "group_selection_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "committee_application_interview_attendee_pkey" PRIMARY KEY ("group_selection_id", "user_id")
);

CREATE INDEX "committee_application_interview_attendee_user_id_idx" ON "committee_application_interview_attendee"("user_id");

ALTER TABLE "committee_application_interview_attendee"
ADD CONSTRAINT "committee_application_interview_attendee_selection_fkey" FOREIGN KEY ("group_selection_id") REFERENCES "committee_application_group_selection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "committee_application_interview_attendee"
ADD CONSTRAINT "committee_application_interview_attendee_user_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
