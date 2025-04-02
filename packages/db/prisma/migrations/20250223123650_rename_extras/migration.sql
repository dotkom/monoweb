/*
  Warnings:

  - You are about to drop the column `selectionsOptions` on the `attendee` table. All the data in the column will be lost.
  - Made the column `selections` on table `attendance` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "attendance" ALTER COLUMN "selections" SET NOT NULL,
ALTER COLUMN "selections" SET DEFAULT '[]';

-- AlterTable
ALTER TABLE "attendee" DROP COLUMN "selectionsOptions",
ADD COLUMN     "selectionResponses" JSONB NOT NULL DEFAULT '[]';
