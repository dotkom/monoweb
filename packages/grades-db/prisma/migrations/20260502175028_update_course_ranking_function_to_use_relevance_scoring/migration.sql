DROP FUNCTION IF EXISTS rank_search;

-- Scores courses based on relevance to the search term.
-- The higher the score, the more relevant the course is.
-- Discontinued courses are always ranked lower than currently taught courses (i.e. last_year_taught is NULL).
CREATE OR REPLACE FUNCTION course_rank_score(
    code TEXT,
    name_no TEXT,
    name_en TEXT,
    last_year_taught INTEGER,
    search_term TEXT
)
RETURNS INTEGER AS
$$
DECLARE
    score INTEGER := 0;
    search_starts_with TEXT;
    search_contains TEXT;
BEGIN
    -- Currently taught courses are always ranked higher than discontinued courses
    IF last_year_taught IS NULL THEN
        score := 1000;
    ELSE
        score := 0;
    END IF;

    IF search_term IS NULL OR TRIM(search_term) = '' THEN
        RETURN score;
    END IF;

    search_starts_with := search_term || '%';
    search_contains := '%' || search_term || '%';

    RETURN score + CASE
        -- Exact match
        WHEN code ILIKE search_term THEN 100
        WHEN name_no ILIKE search_term OR name_en ILIKE search_term THEN 90

        -- Starts with
        WHEN code ILIKE search_starts_with THEN 80
        WHEN name_no ILIKE search_starts_with OR name_en ILIKE search_starts_with THEN 70

        -- Contains
        WHEN code ILIKE search_contains THEN 60
        WHEN name_no ILIKE search_contains OR name_en ILIKE search_contains THEN 50

        ELSE 0
    END;
END;
$$
LANGUAGE plpgsql;
