-- DropForeignKey
ALTER TABLE "personal_mark" DROP CONSTRAINT "personal_mark_givenById_fkey";

-- AlterTable
ALTER TABLE "personal_mark" ALTER COLUMN "givenById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "personal_mark" ADD CONSTRAINT "personal_mark_givenById_fkey" FOREIGN KEY ("givenById") REFERENCES "ow_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
