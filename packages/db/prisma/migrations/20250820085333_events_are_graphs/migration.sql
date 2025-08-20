-- AlterTable
ALTER TABLE "event" ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_parent_fkey" FOREIGN KEY ("parentId") REFERENCES "event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
