BEGIN TRANSACTION;

CREATE TYPE subject_write_log_grade AS ENUM ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H');

CREATE TABLE IF NOT EXISTS subject_season_grade_write_log
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ      NOT NULL DEFAULT now(),
    subject_id UUID                    NOT NULL,
    season     subject_season          NOT NULL,
    year       INTEGER                 NOT NULL,
    grade      subject_write_log_grade NOT NULL,

    CONSTRAINT subject_season_grade_write_log_fk_subject_id FOREIGN KEY (subject_id) REFERENCES subject (id) ON DELETE CASCADE,
    CONSTRAINT subject_season_grade_write_log_uq_subject_season_grade_year_gra UNIQUE (subject_id, season, year, grade)
);

COMMIT;
