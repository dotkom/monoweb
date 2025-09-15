ALTER TABLE "group" RENAME COLUMN "description" TO "shortDescription";
ALTER TABLE "group" RENAME COLUMN "about" TO "description";

ALTER TABLE "event" RENAME COLUMN "subtitle" TO "shortDescription";
ALTER TABLE "event" RENAME COLUMN "about" TO "description";

ALTER TABLE "job_listing" RENAME COLUMN "description" TO "shortDescription";
ALTER TABLE "job_listing" RENAME COLUMN "about" TO "description";
