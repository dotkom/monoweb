CREATE TYPE "group_type" AS ENUM ('COMMITTEE', 'NODECOMMITTEE', 'OTHERGROUP');

ALTER TABLE "event_committee" DROP CONSTRAINT "event_committee_committeeId_fkey";
ALTER TABLE "event_committee" DROP CONSTRAINT "event_committee_eventId_fkey";

ALTER TABLE "committee" RENAME TO "group";
ALTER TABLE "event_committee" RENAME TO "event_hosting_group";

ALTER TABLE "event_hosting_group" RENAME COLUMN "committeeId" TO "groupId";
ALTER TABLE "group" ADD COLUMN "type" "group_type" NOT NULL;

ALTER TABLE "event_hosting_group" RENAME CONSTRAINT "event_committee_pkey" TO "event_hosting_group_pkey";
ALTER TABLE "event_hosting_group" ADD CONSTRAINT "event_hosting_group_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "event_hosting_group" ADD CONSTRAINT "event_hosting_group_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "group" RENAME CONSTRAINT "committee_pkey" TO "group_pkey";
