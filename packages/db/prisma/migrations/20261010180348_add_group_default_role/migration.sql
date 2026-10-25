-- Add the column nullable so existing groups can be backfilled before it is required.
ALTER TABLE "group" ADD COLUMN "default_group_role_id" TEXT;

-- Target for the composite foreign key, so a group's default role must be one of its own roles.
CREATE UNIQUE INDEX "group_role_id_group_id_key" ON "group_role"("id", "group_id");

INSERT INTO "group_role" ("id", "name", "type", "group_id")
SELECT gen_random_uuid(), 'Medlem', 'COSMETIC', g."slug"
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

UPDATE "group" AS g
SET "default_group_role_id" = picked."id"
FROM (
  SELECT DISTINCT ON ("group_id") "id", "group_id"
  FROM "group_role"
  WHERE "type" = 'COSMETIC' OR "name" = 'Medlem'
  ORDER BY "group_id", CASE WHEN "name" = 'Medlem' THEN 0 ELSE 1 END, "id"
) AS picked
WHERE g."slug" = picked."group_id";

ALTER TABLE "group" ALTER COLUMN "default_group_role_id" SET NOT NULL;

CREATE UNIQUE INDEX "group_default_group_role_id_key" ON "group"("default_group_role_id");

CREATE UNIQUE INDEX "group_default_group_role_id_slug_key" ON "group"("default_group_role_id", "slug");

-- Deferred so a group and its default role can be inserted in one transaction, and so deleting a
-- group can cascade to that role. NO ACTION still rejects deleting the role while the group points at it.
ALTER TABLE "group" ADD CONSTRAINT "group_default_group_role_id_slug_fkey" FOREIGN KEY ("default_group_role_id", "slug") REFERENCES "group_role"("id", "group_id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED;
