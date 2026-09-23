ALTER TABLE "committee_application"
ADD COLUMN "study_year" INTEGER,
ADD CONSTRAINT "committee_application_study_year_check" CHECK ("study_year" BETWEEN 1 AND 5);
