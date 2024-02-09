START TRANSACTION;

CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch";

CREATE TABLE IF NOT EXISTS faculty
(
    id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_id TEXT NOT NULL,
    name   TEXT NOT NULL,

    CONSTRAINT faculty_ref_id_unique UNIQUE (ref_id)
);

CREATE TABLE IF NOT EXISTS department
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_id     TEXT NOT NULL,
    faculty_id UUID NOT NULL,
    name       TEXT NOT NULL,

    CONSTRAINT department_fk_faculty_id FOREIGN KEY (faculty_id) REFERENCES faculty (id),
    CONSTRAINT department_uq_ref_id UNIQUE (ref_id)
);

COMMIT;
