-- CreateEnum
CREATE TYPE "system_achievement_trigger" AS ENUM ('PROFILE_COMPLETION', 'ATTENDED_EVENTS');

-- CreateEnum
CREATE TYPE "achievement_tier_level" AS ENUM ('BRONZE', 'SILVER', 'GOLD');

-- CreateTable
CREATE TABLE "achievement" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "system_trigger" "system_achievement_trigger",

    CONSTRAINT "achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement_tier" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" "achievement_tier_level" NOT NULL,
    "required_count" INTEGER NOT NULL,
    "achievement_id" TEXT NOT NULL,

    CONSTRAINT "achievement_tier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievement" (
    "id" TEXT NOT NULL,
    "awarded_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "tier_id" TEXT,

    CONSTRAINT "user_achievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "achievement_system_trigger_key" ON "achievement"("system_trigger");

-- CreateIndex
CREATE INDEX "achievement_tier_achievement_id_idx" ON "achievement_tier"("achievement_id");

-- CreateIndex
CREATE UNIQUE INDEX "achievement_tier_achievement_id_level_key" ON "achievement_tier"("achievement_id", "level");

-- CreateIndex
CREATE UNIQUE INDEX "achievement_tier_achievement_id_required_count_key" ON "achievement_tier"("achievement_id", "required_count");

-- CreateIndex
CREATE UNIQUE INDEX "achievement_tier_id_achievement_id_key" ON "achievement_tier"("id", "achievement_id");

-- CreateIndex
CREATE INDEX "user_achievement_user_id_idx" ON "user_achievement"("user_id");

-- CreateIndex
CREATE INDEX "user_achievement_achievement_id_idx" ON "user_achievement"("achievement_id");

-- CreateIndex
CREATE INDEX "user_achievement_tier_id_idx" ON "user_achievement"("tier_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievement_user_id_achievement_id_key" ON "user_achievement"("user_id", "achievement_id");

-- AddForeignKey
ALTER TABLE "achievement_tier" ADD CONSTRAINT "achievement_tier_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievement" ADD CONSTRAINT "user_achievement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievement" ADD CONSTRAINT "user_achievement_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievement" ADD CONSTRAINT "user_achievement_tier_id_achievement_id_fkey" FOREIGN KEY ("tier_id", "achievement_id") REFERENCES "achievement_tier"("id", "achievement_id") ON DELETE RESTRICT ON UPDATE CASCADE;
