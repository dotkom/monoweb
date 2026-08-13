-- Merge any duplicate progress before enforcing one progress row per user.
WITH "merged_progress" AS MATERIALIZED (
    SELECT
        "user_id",
        (ARRAY_AGG("id" ORDER BY "created_at" DESC, "id" DESC))[1] AS "retained_id",
        BOOL_OR("has_set_profile_picture") AS "has_set_profile_picture",
        BOOL_OR("has_set_username") AS "has_set_username",
        BOOL_OR("has_awarded_team_profile_bonus") AS "has_awarded_team_profile_bonus"
    FROM "temporary_fadderuke_contest_profile_progress"
    GROUP BY "user_id"
),
"updated_progress" AS (
    UPDATE "temporary_fadderuke_contest_profile_progress" AS "progress"
    SET
        "has_set_profile_picture" = "merged_progress"."has_set_profile_picture",
        "has_set_username" = "merged_progress"."has_set_username",
        "has_awarded_team_profile_bonus" = "merged_progress"."has_awarded_team_profile_bonus"
    FROM "merged_progress"
    WHERE "progress"."id" = "merged_progress"."retained_id"
    RETURNING "progress"."id"
)
DELETE FROM "temporary_fadderuke_contest_profile_progress" AS "progress"
USING "merged_progress"
WHERE
    "progress"."user_id" = "merged_progress"."user_id"
    AND "progress"."id" <> "merged_progress"."retained_id";

-- Keep automatic point accounting and the team bonus claim on the contestant.
ALTER TABLE "contestant"
ADD COLUMN "fadderuke_profile_points_awarded" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "has_awarded_fadderuke_profile_team_bonus" BOOLEAN NOT NULL DEFAULT false;

-- Preserve the previous 2026 campaign state before removing the user-scoped bonus flag.
WITH "fadderuke_contestants" AS (
    SELECT
        "contestant"."id",
        "contestant"."user_id"
    FROM "contestant"
    INNER JOIN "event" ON "event"."contest_id" = "contestant"."contest_id"
    INNER JOIN "fadderuke" ON
        "fadderuke"."event_id" = "event"."id"
        AND "fadderuke"."year" = 2026
),
"contestant_members" AS (
    SELECT
        "fadderuke_contestants"."id" AS "contestant_id",
        "fadderuke_contestants"."user_id"
    FROM "fadderuke_contestants"
    WHERE "fadderuke_contestants"."user_id" IS NOT NULL

    UNION ALL

    SELECT
        "fadderuke_contestants"."id" AS "contestant_id",
        "team_members"."B" AS "user_id"
    FROM "fadderuke_contestants"
    INNER JOIN "contest_team"
        ON "contest_team"."contestant_id" = "fadderuke_contestants"."id"
    INNER JOIN "_ContestTeamMember" AS "team_members"
        ON "team_members"."A" = "contest_team"."id"
),
"contestant_profile_totals" AS (
    SELECT
        "contestant_members"."contestant_id",
        SUM(
            CASE WHEN "progress"."has_set_username" THEN 10 ELSE 0 END
            + CASE WHEN "progress"."has_set_profile_picture" THEN 10 ELSE 0 END
        )::INTEGER AS "profile_points_awarded",
        BOOL_OR("progress"."has_awarded_team_profile_bonus") AS "has_awarded_team_profile_bonus"
    FROM "contestant_members"
    INNER JOIN "temporary_fadderuke_contest_profile_progress" AS "progress"
        ON "progress"."user_id" = "contestant_members"."user_id"
    GROUP BY "contestant_members"."contestant_id"
)
UPDATE "contestant"
SET
    "fadderuke_profile_points_awarded" = "contestant_profile_totals"."profile_points_awarded",
    "has_awarded_fadderuke_profile_team_bonus" =
        "contestant_profile_totals"."has_awarded_team_profile_bonus"
FROM "contestant_profile_totals"
WHERE "contestant"."id" = "contestant_profile_totals"."contestant_id";

ALTER TABLE "temporary_fadderuke_contest_profile_progress"
DROP COLUMN "has_awarded_team_profile_bonus";

-- CreateIndex
CREATE UNIQUE INDEX "temporary_fadderuke_contest_profile_progress_user_id_key"
ON "temporary_fadderuke_contest_profile_progress"("user_id");
