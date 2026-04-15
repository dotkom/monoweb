CREATE OR REPLACE FUNCTION rank_search(
    code TEXT,
    norwegian_name TEXT,
    english_name TEXT,
    last_year_taught INTEGER,
    search_term TEXT
)
RETURNS INTEGER AS
$$
DECLARE
    search_starts_with TEXT;
    search_contains TEXT;
    baseline INTEGER;
BEGIN
    IF search_term IS NULL THEN
        RETURN 0;
    END IF;

    search_starts_with := search_term || '%';
    search_contains := '%' || search_term || '%';

    baseline := CASE
        WHEN last_year_taught IS NOT NULL THEN 1000
        ELSE 0
    END;

    RETURN baseline + CASE
        WHEN code = search_term THEN 0
        WHEN code ILIKE search_starts_with THEN 1
        WHEN norwegian_name = search_term OR english_name = search_term THEN 2
        WHEN norwegian_name ILIKE search_starts_with OR english_name ILIKE search_starts_with THEN 3
        WHEN code ILIKE search_contains THEN 4
        WHEN norwegian_name ILIKE search_contains OR english_name ILIKE search_contains THEN 5
        ELSE 6
    END;
END;
$$
LANGUAGE plpgsql;
