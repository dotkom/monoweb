-- AlterTable
ALTER TABLE "group_role" ADD COLUMN "is_default" BOOLEAN NOT NULL DEFAULT false;

-- Ensure every group has a Medlem/COSMETIC role to mark as default.
INSERT INTO "group_role" ("id", "name", "type", "group_id", "is_default")
SELECT gen_random_uuid(), 'Medlem', 'COSMETIC', g."slug", false
FROM "group" g
WHERE NOT EXISTS (
  SELECT 1
  FROM "group_role" r
  WHERE r."group_id" = g."slug" AND r."type" = 'COSMETIC'
)
AND NOT EXISTS (
  SELECT 1
  FROM "group_role" r
  WHERE r."group_id" = g."slug" AND r."name" = 'Medlem'
);

-- Pick one default per group: prefer name Medlem, else any COSMETIC.
UPDATE "group_role" AS r
SET "is_default" = true
FROM (
  SELECT DISTINCT ON ("group_id") "id"
  FROM "group_role"
  WHERE "type" = 'COSMETIC' OR "name" = 'Medlem'
  ORDER BY "group_id", CASE WHEN "name" = 'Medlem' THEN 0 ELSE 1 END, "id"
) AS picked
WHERE r."id" = picked."id";

-- CreateIndex
CREATE UNIQUE INDEX "group_role_group_id_key" ON "group_role"("group_id") WHERE (is_default = true);