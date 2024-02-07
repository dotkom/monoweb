START TRANSACTION;

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

CREATE TABLE IF NOT EXISTS ntnu_faculty
(
    id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_id TEXT NOT NULL,
    name   TEXT NOT NULL,

    CONSTRAINT ntnu_faculty_uq_ref_id UNIQUE (ref_id)
);

CREATE TABLE IF NOT EXISTS ntnu_faculty_department
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_id     TEXT NOT NULL,
    faculty_id UUID NOT NULL,
    name       TEXT NOT NULL,

    CONSTRAINT ntnu_faculty_department_fk_faculty_id FOREIGN KEY (faculty_id) REFERENCES ntnu_faculty (id),
    CONSTRAINT ntnu_faculty_department_uq_ref_id UNIQUE (ref_id)
);

CREATE TABLE IF NOT EXISTS subject
(
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_id               TEXT  NOT NULL,
    name                 TEXT  NOT NULL,
    slug                 TEXT  NOT NULL,
    department_id        UUID  NOT NULL,

    instruction_language TEXT  NOT NULL,
    educational_level    TEXT  NOT NULL,
    credits              FLOAT NOT NULL,

    CONSTRAINT subject_fk_department_id FOREIGN KEY (department_id) REFERENCES ntnu_faculty_department (id),
    CONSTRAINT subject_uq_ref_id UNIQUE (ref_id)
);

CREATE TYPE subject_season AS ENUM ('SPRING', 'AUTUMN', 'WINTER', 'SUMMER');

CREATE TABLE IF NOT EXISTS subject_season_grade
(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id  UUID           NOT NULL,
    season      subject_season NOT NULL,
    year        INTEGER        NOT NULL,
    grade       FLOAT          NOT NULL,

    graded_a    INTEGER,
    graded_b    INTEGER,
    graded_c    INTEGER,
    graded_d    INTEGER,
    graded_e    INTEGER,
    graded_f    INTEGER,

    graded_fail INTEGER,
    graded_pass INTEGER,

    CONSTRAINT fk_subject_id FOREIGN KEY (subject_id) REFERENCES subject (id)
);

COMMIT;
