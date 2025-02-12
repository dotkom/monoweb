/*
  Warnings:

  - You are about to drop the `JobListingLocationLink` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "JobListingLocationLink" DROP CONSTRAINT "JobListingLocationLink_jobListingId_fkey";

-- DropForeignKey
ALTER TABLE "JobListingLocationLink" DROP CONSTRAINT "JobListingLocationLink_locationId_fkey";

-- DropTable
DROP TABLE "JobListingLocationLink";

-- CreateTable
CREATE TABLE "_JobListingToJobListingLocation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JobListingToJobListingLocation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_JobListingToJobListingLocation_B_index" ON "_JobListingToJobListingLocation"("B");

-- AddForeignKey
ALTER TABLE "_JobListingToJobListingLocation" ADD CONSTRAINT "_JobListingToJobListingLocation_A_fkey" FOREIGN KEY ("A") REFERENCES "JobListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobListingToJobListingLocation" ADD CONSTRAINT "_JobListingToJobListingLocation_B_fkey" FOREIGN KEY ("B") REFERENCES "JobListingLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
