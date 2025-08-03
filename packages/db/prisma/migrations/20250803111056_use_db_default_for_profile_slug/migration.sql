-- AlterTable
ALTER TABLE "ow_user" ALTER COLUMN "profileSlug" SET DEFAULT gen_random_uuid()::text;
