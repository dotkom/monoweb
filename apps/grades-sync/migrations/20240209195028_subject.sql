BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS subject
(
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_id               TEXT NOT NULL,
    name                 TEXT NOT NULL,
    slug                 TEXT NOT NULL,
    department_id        UUID NOT NULL,

    instruction_language TEXT NOT NULL,
    educational_level    TEXT NOT NULL,
    credits              REAL NOT NULL,

    average_grade        REAL NOT NULL    DEFAULT 0.0,
    total_students       INT  NOT NULL    DEFAULT 0,
    failed_students      INT  NOT NULL    DEFAULT 0,

    CONSTRAINT subject_fk_department_id FOREIGN KEY (department_id) REFERENCES department (id),
    CONSTRAINT subject_uq_ref_id UNIQUE (ref_id)
);

COMMIT;
