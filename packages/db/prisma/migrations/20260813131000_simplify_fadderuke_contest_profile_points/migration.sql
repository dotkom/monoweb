ALTER TABLE "contestant"
ADD COLUMN "fadderuke_profile_points_awarded" INTEGER NOT NULL DEFAULT 0;

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
"user_progress" AS (
    SELECT
        "user_id",
        BOOL_OR("has_set_username") AS "has_set_username",
        BOOL_OR("has_set_profile_picture") AS "has_set_profile_picture",
        BOOL_OR("has_awarded_team_profile_bonus") AS "has_awarded_team_profile_bonus"
    FROM "temporary_fadderuke_contest_profile_progress"
    GROUP BY "user_id"
),
"contestant_profile_totals" AS (
    SELECT
        "contestant_members"."contestant_id",
        SUM(
            CASE WHEN "user_progress"."has_set_username" THEN 10 ELSE 0 END
            + CASE WHEN "user_progress"."has_set_profile_picture" THEN 10 ELSE 0 END
        )::INTEGER AS "profile_points_awarded",
        BOOL_OR("user_progress"."has_awarded_team_profile_bonus") AS "has_awarded_team_profile_bonus"
    FROM "contestant_members"
    INNER JOIN "user_progress"
        ON "user_progress"."user_id" = "contestant_members"."user_id"
    GROUP BY "contestant_members"."contestant_id"
)
UPDATE "contestant"
SET "fadderuke_profile_points_awarded" = CASE
    WHEN "contestant_profile_totals"."has_awarded_team_profile_bonus" THEN 1000
    ELSE "contestant_profile_totals"."profile_points_awarded"
END
FROM "contestant_profile_totals"
WHERE "contestant"."id" = "contestant_profile_totals"."contestant_id";

-- DropTable
DROP TABLE "temporary_fadderuke_contest_profile_progress";
