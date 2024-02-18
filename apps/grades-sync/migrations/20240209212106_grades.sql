START TRANSACTION;

CREATE TYPE subject_grading_season AS ENUM ('WINTER', 'SPRING', 'SUMMER', 'AUTUMN');

CREATE TABLE IF NOT EXISTS subject_season_grade
(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id  UUID                   NOT NULL,
    season      subject_grading_season NOT NULL,
    year        INTEGER                NOT NULL,

    graded_a    INTEGER,
    graded_b    INTEGER,
    graded_c    INTEGER,
    graded_d    INTEGER,
    graded_e    INTEGER,
    graded_f    INTEGER,
    graded_pass INTEGER,
    graded_fail INTEGER,

    CONSTRAINT subject_season_grade_fk_subject_id FOREIGN KEY (subject_id) REFERENCES subject (id),
    CONSTRAINT subject_season_grade_unique UNIQUE (subject_id, season, year)
);

COMMIT;
