-- CreateEnum
CREATE TYPE "contest_result_type" AS ENUM ('SCORE', 'DURATION', 'WINNER');

-- CreateTable
CREATE TABLE "contest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "result_type" "contest_result_type" NOT NULL,

    CONSTRAINT "contest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contestant" (
    "id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "user_id" TEXT,
    "winning_result_id" TEXT,

    CONSTRAINT "contestant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contest_team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contestant_id" TEXT NOT NULL,

    CONSTRAINT "contest_team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contest_result" (
    "id" TEXT NOT NULL,
    "score" INTEGER,
    "duration" INTEGER,
    "contest_id" TEXT NOT NULL,

    CONSTRAINT "contest_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ContestTeamMember" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ContestTeamMember_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "contestant_contest_id_user_id_key" ON "contestant"("contest_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "contestant_winning_result_id_contest_id_key" ON "contestant"("winning_result_id", "contest_id");

-- CreateIndex
CREATE UNIQUE INDEX "contest_team_contestant_id_key" ON "contest_team"("contestant_id");

-- CreateIndex
CREATE UNIQUE INDEX "contest_result_contest_id_key" ON "contest_result"("contest_id");

-- CreateIndex
CREATE UNIQUE INDEX "contest_result_id_contest_id_key" ON "contest_result"("id", "contest_id");

-- CreateIndex
CREATE INDEX "_ContestTeamMember_B_index" ON "_ContestTeamMember"("B");

-- AddForeignKey
ALTER TABLE "contestant" ADD CONSTRAINT "contestant_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contestant" ADD CONSTRAINT "contestant_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contestant" ADD CONSTRAINT "contestant_winning_result_id_contest_id_fkey" FOREIGN KEY ("winning_result_id", "contest_id") REFERENCES "contest_result"("id", "contest_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_team" ADD CONSTRAINT "contest_team_contestant_id_fkey" FOREIGN KEY ("contestant_id") REFERENCES "contestant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_result" ADD CONSTRAINT "contest_result_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContestTeamMember" ADD CONSTRAINT "_ContestTeamMember_A_fkey" FOREIGN KEY ("A") REFERENCES "contest_team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContestTeamMember" ADD CONSTRAINT "_ContestTeamMember_B_fkey" FOREIGN KEY ("B") REFERENCES "ow_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
