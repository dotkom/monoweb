-- AlterTable
ALTER TABLE "event" ALTER COLUMN "locationTitle" DROP NOT NULL;

UPDATE "event" SET "description" = 'Ingen beskrivelse tilgjengelig.' WHERE "description" IS NULL;

-- AlterTable
ALTER TABLE "event" ALTER COLUMN "description" SET NOT NULL;
