/*
  Warnings:

  - You are about to drop the `_JobListingToJobListingLocation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_JobListingToJobListingLocation" DROP CONSTRAINT "_JobListingToJobListingLocation_A_fkey";

-- DropForeignKey
ALTER TABLE "_JobListingToJobListingLocation" DROP CONSTRAINT "_JobListingToJobListingLocation_B_fkey";

-- DropTable
DROP TABLE "_JobListingToJobListingLocation";

-- CreateTable
CREATE TABLE "JobListingLocationLink" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobListingId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,

    CONSTRAINT "JobListingLocationLink_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobListingLocationLink" ADD CONSTRAINT "JobListingLocationLink_jobListingId_fkey" FOREIGN KEY ("jobListingId") REFERENCES "JobListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobListingLocationLink" ADD CONSTRAINT "JobListingLocationLink_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "JobListingLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
