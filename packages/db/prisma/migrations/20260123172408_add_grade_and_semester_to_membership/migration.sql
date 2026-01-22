ALTER TABLE "membership"
ADD COLUMN "semester" INTEGER;

UPDATE "membership" SET "semester" = 0;

ALTER TABLE "membership"
ALTER COLUMN "semester" SET NOT NULL;
