-- DropForeignKey
ALTER TABLE "contest_team" DROP CONSTRAINT "contest_team_contestant_id_fkey";

-- DropForeignKey
ALTER TABLE "contestant" DROP CONSTRAINT "contestant_contest_id_fkey";

-- AddForeignKey
ALTER TABLE "contestant" ADD CONSTRAINT "contestant_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_team" ADD CONSTRAINT "contest_team_contestant_id_fkey" FOREIGN KEY ("contestant_id") REFERENCES "contestant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
