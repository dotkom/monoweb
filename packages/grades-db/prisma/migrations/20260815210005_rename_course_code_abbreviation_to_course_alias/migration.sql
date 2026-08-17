ALTER TABLE "course_code_abbreviation" RENAME TO "course_alias";

ALTER TABLE "course_alias" RENAME COLUMN "abbreviation" TO "alias";

ALTER TABLE "course_alias" RENAME CONSTRAINT "course_code_abbreviation_pkey" TO "course_alias_pkey";

ALTER TABLE "course_alias" RENAME CONSTRAINT "course_code_abbreviation_course_id_fkey" TO "course_alias_course_id_fkey";


DROP FUNCTION IF EXISTS course_rank_score(TEXT, TEXT[], TEXT, TEXT, TEXT);

-- Scores courses based on relevance to the search term.
-- The higher the score, the more relevant the course is.
-- Inactive vs active ordering is applied by the caller, not this function.
CREATE OR REPLACE FUNCTION course_rank_score(
    code TEXT,
    aliases TEXT[],
    name_no TEXT,
    name_en TEXT,
    search_term TEXT
)
RETURNS INTEGER AS
$$
DECLARE
    search_starts_with TEXT;
    search_contains TEXT;
BEGIN
    IF search_term IS NULL OR TRIM(search_term) = '' THEN
        RETURN 0;
    END IF;

    search_starts_with := search_term || '%';
    search_contains := '%' || search_term || '%';

    RETURN CASE
        -- Exact match
        WHEN code ILIKE search_term THEN 100
        WHEN EXISTS (
            SELECT 1
            FROM unnest(aliases) alias
            WHERE alias ILIKE search_term
        ) THEN 95
        WHEN name_no ILIKE search_term OR name_en ILIKE search_term THEN 90

        -- Starts with
        WHEN code ILIKE search_starts_with THEN 80
        WHEN EXISTS (
            SELECT 1
            FROM unnest(aliases) alias
            WHERE alias ILIKE search_starts_with
        ) THEN 75
        WHEN name_no ILIKE search_starts_with OR name_en ILIKE search_starts_with THEN 70

        -- Contains
        WHEN code ILIKE search_contains THEN 60
        WHEN name_no ILIKE search_contains OR name_en ILIKE search_contains THEN 50
        WHEN EXISTS (
            SELECT 1
            FROM unnest(aliases) alias
            WHERE alias ILIKE search_contains
        ) THEN 40

        ELSE 0
    END;
END;
$$
LANGUAGE plpgsql
STABLE
PARALLEL SAFE;
