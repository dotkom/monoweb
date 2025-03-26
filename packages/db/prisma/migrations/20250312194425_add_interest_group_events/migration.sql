-- CreateTable
CREATE TABLE "event_interest_group" (
    "eventId" TEXT NOT NULL,
    "interestGroupId" TEXT NOT NULL,

    CONSTRAINT "event_interest_group_pkey" PRIMARY KEY ("eventId","interestGroupId")
);

-- AddForeignKey
ALTER TABLE "event_interest_group" ADD CONSTRAINT "event_interest_group_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_interest_group" ADD CONSTRAINT "event_interest_group_interestGroupId_fkey" FOREIGN KEY ("interestGroupId") REFERENCES "interest_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
