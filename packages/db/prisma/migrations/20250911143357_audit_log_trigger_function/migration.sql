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
            row_id_value := NULL;
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
        END),
        current_setting('app.current_transaction_id', true)
    );
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS event_audit ON event;
DROP TRIGGER IF EXISTS ow_user_audit ON ow_user;
DROP TRIGGER IF EXISTS event_hosting_group_audit ON event_hosting_group;
DROP TRIGGER IF EXISTS job_listing_audit ON job_listing;
DROP TRIGGER IF EXISTS article_audit ON article;
DROP TRIGGER IF EXISTS attendee_audit ON attendee;

-- Recreate triggers with updated function
CREATE TRIGGER event_audit
AFTER INSERT OR UPDATE OR DELETE ON event
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER ow_user_audit
AFTER INSERT OR UPDATE OR DELETE ON ow_user
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER event_hosting_group_audit
AFTER INSERT OR UPDATE OR DELETE ON event_hosting_group
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER job_listing_audit
AFTER INSERT OR UPDATE OR DELETE ON job_listing
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER article_audit
AFTER INSERT OR UPDATE OR DELETE ON article
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER attendee_audit
AFTER INSERT OR UPDATE OR DELETE ON attendee
FOR EACH ROW EXECUTE FUNCTION if_modified_func();