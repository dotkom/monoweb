-- CreateTable
CREATE TABLE "temporary_fadderuke_contest_profile_progress" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "has_set_profile_picture" BOOLEAN NOT NULL DEFAULT false,
    "has_set_username" BOOLEAN NOT NULL DEFAULT false,
    "has_awarded_team_profile_bonus" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "temporary_fadderuke_contest_profile_progress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "temporary_fadderuke_contest_profile_progress" ADD CONSTRAINT "temporary_fadderuke_contest_profile_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "ow_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
