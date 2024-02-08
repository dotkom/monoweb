BEGIN TRANSACTION;

CREATE UNIQUE INDEX subject_season_grade_uq_subject_id_season_year ON subject_season_grade (subject_id, season, year);

COMMIT;
