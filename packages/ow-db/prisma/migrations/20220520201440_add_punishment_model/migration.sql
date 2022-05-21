-- CreateEnum
CREATE TYPE "PunishmentType" AS ENUM ('SUSPENSION', 'MARK');

-- CreateTable
CREATE TABLE "PunishmentRuleSet" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "PunishmentRuleSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Punishment" (
    "id" TEXT NOT NULL,
    "type" "PunishmentType" NOT NULL,
    "ruleset_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Punishment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Punishment" ADD CONSTRAINT "Punishment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Punishment" ADD CONSTRAINT "Punishment_ruleset_id_fkey" FOREIGN KEY ("ruleset_id") REFERENCES "PunishmentRuleSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
