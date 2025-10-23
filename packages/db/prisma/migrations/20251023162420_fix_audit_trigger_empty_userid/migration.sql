CREATE or REPLACE FUNCTION if_modified_func()
RETURNS TRIGGER AS $$
DECLARE
    row_id_value TEXT := NULL;
BEGIN
    BEGIN
        row_id_value := CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id::text
            WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.id::text, OLD.id::text)
            WHEN TG_OP = 'INSERT' THEN NEW.id::text
            ELSE NULL
        END;
    EXCEPTION
        WHEN undefined_column THEN
        BEGIN
            row_id_value:= CASE
                WHEN TG_OP = 'DELETE' THEN OLD.slug::text
                WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.slug::text, OLD.slug::text)
                WHEN TG_OP = 'INSERT' THEN NEW.slug::text
                ELSE NULL
            END;
    EXCEPTION
        WHEN undefined_column THEN
        BEGIN
            row_id_value := NULL;
            END;
        END;
    END;

    INSERT INTO audit_log(
        id,
        "tableName", 
        operation, 
        "rowId", 
        "userId", 
        "createdAt", 
        "rowData",
        "transactionId"
    )
    VALUES (
        gen_random_uuid(),
        TG_TABLE_NAME,
        TG_OP,
        row_id_value,
        NULLIF(NULLIF(current_setting('app.current_user_id', true),'SYSTEM'), '')::text,
        now(),
        (CASE 
            WHEN TG_OP = 'DELETE' THEN jsonb_build_object('deleted',to_jsonb(OLD))
            WHEN TG_OP = 'INSERT' THEN jsonb_build_object('inserted',to_jsonb(NEW))
            WHEN TG_OP = 'UPDATE' THEN (
              COALESCE(
              (SELECT jsonb_object_agg(key,jsonb_build_object('old',old_val,'new',new_val))
              FROM (
                SELECT o.key, o.value AS old_val, n.value AS new_val
                FROM jsonb_each_text(to_jsonb(OLD)) AS o(key, value)
                JOIN jsonb_each_text(to_jsonb(NEW)) AS n(key, value) USING (key)
                WHERE o.value IS DISTINCT FROM n.value
              ) diffs),
              '{}' :: jsonb
            )
            )
            ELSE '{}' :: jsonb
        END),
        pg_current_xact_id()::text::bigint
    );
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;