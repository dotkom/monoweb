CREATE OR REPLACE FUNCTION rank_search(
    code TEXT,
    name_no TEXT,
    name_en TEXT,
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
        WHEN name_no = search_term OR name_en = search_term THEN 2
        WHEN name_no ILIKE search_starts_with OR name_en ILIKE search_starts_with THEN 3
        WHEN code ILIKE search_contains THEN 4
        WHEN name_no ILIKE search_contains OR name_en ILIKE search_contains THEN 5
        ELSE 6
    END;
END;
$$
LANGUAGE plpgsql;
