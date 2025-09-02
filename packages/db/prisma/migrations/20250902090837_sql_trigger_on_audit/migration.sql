CREATE or REPLACE FUNCTION if_modified_func()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log(
    id,
    "tableName", 
    operation, 
    "rowId", 
    "userId", 
    "createdAt", 
    "rowData"
    )
    VALUES (
        gen_random_uuid(),
        TG_TABLE_NAME,
        TG_OP,
        (CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id::text
            WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.id::text, OLD.id::text)
            WHEN TG_OP = 'INSERT' THEN NEW.id::text
            ELSE NULL
        END),
        NULLIF(current_setting('app.current_user_id', true),'SYSTEM')::text,
        now(),
        (CASE 
            WHEN TG_OP = 'DELETE' THEN jsonb_build_object('old',to_jsonb(OLD))
            WHEN TG_OP = 'INSERT' THEN jsonb_build_object('new',to_jsonb(NEW))
            WHEN TG_OP = 'UPDATE' THEN (
              SELECT jsonb_object_agg(key,jsonb_build_object('old',old_val,'new',new_val))
              FROM (
                SELECT o.key, o.value AS old_val, n.value AS new_val
                FROM jsonb_each_text(to_jsonb(OLD)) AS o(key, value)
                JOIN jsonb_each_text(to_jsonb(NEW)) AS n(key, value) USING (key)
                WHERE o.value IS DISTINCT FROM n.value
              ) diffs
              )
            ELSE NULL
        END)
    );
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_audit
AFTER INSERT OR UPDATE OR DELETE ON event
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER ow_user_audit
AFTER INSERT OR UPDATE OR DELETE ON ow_user
FOR EACH ROW EXECUTE FUNCTION if_modified_func();