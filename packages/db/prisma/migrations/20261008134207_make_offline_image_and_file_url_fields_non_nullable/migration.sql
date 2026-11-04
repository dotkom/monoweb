UPDATE "offline" SET "file_url" = '' WHERE "file_url" IS NULL;
UPDATE "offline" SET "image_url" = '' WHERE "image_url" IS NULL;

-- AlterTable
ALTER TABLE "offline" ALTER COLUMN "file_url" SET NOT NULL,
ALTER COLUMN "image_url" SET NOT NULL;
