ALTER TABLE "committee_application_period" ALTER COLUMN "interviews_published_at" DROP NOT NULL;

-- Preserve schedules already visible under the previous publication-time behavior.
UPDATE "committee_application_period" AS period
SET "interviews_published_at" = NULL
WHERE period."interviews_published_at" > CURRENT_TIMESTAMP
   OR NOT EXISTS (
     SELECT 1 FROM "committee_application_interview" AS interview
     JOIN "committee_application_group_selection" AS selection ON selection.id = interview.group_selection_id
     WHERE selection.application_period_id = period.id
   );

ALTER TABLE "committee_application_group_selection" ALTER COLUMN "rank" DROP NOT NULL;
DROP INDEX "committee_application_group_selection_application_id_rank_key";

UPDATE "committee_application_group_selection" AS selection SET "rank" = NULL
FROM "committee_application_group" AS application_group
WHERE selection.application_group_id = application_group.id AND application_group.type = 'ADDITIVE';

WITH exclusive_ranks AS (
  SELECT selection.id, ROW_NUMBER() OVER (PARTITION BY selection.application_id ORDER BY selection.rank, selection.id) AS rank
  FROM "committee_application_group_selection" AS selection
  JOIN "committee_application_group" AS application_group ON application_group.id = selection.application_group_id
  WHERE application_group.type = 'EXCLUSIVE'
)
UPDATE "committee_application_group_selection" AS selection SET "rank" = exclusive_ranks.rank
FROM exclusive_ranks WHERE selection.id = exclusive_ranks.id;

CREATE UNIQUE INDEX "committee_application_group_selection_application_id_rank_key" ON "committee_application_group_selection" ("application_id", "rank");
ALTER TABLE "committee_application_group_selection" ADD CONSTRAINT "committee_application_group_selection_rank_check" CHECK ("rank" IS NULL OR "rank" > 0);
