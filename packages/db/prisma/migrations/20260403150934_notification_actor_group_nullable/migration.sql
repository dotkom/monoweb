-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_actor_group_id_fkey";

-- AlterTable
ALTER TABLE "notification" ALTER COLUMN "actor_group_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_actor_group_id_fkey" FOREIGN KEY ("actor_group_id") REFERENCES "group"("slug") ON DELETE SET NULL ON UPDATE CASCADE;
