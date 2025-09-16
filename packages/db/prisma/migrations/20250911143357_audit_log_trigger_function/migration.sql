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
            WHEN TG_OP = 'DELETE' THEN jsonb_build_object('deleted',to_jsonb(OLD))
            WHEN TG_OP = 'INSERT' THEN jsonb_build_object('inserted',to_jsonb(NEW))
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



CREATE TRIGGER article_audit
AFTER INSERT OR UPDATE OR DELETE ON article
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER attendee_audit
AFTER INSERT OR UPDATE OR DELETE ON attendee
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER attendance_pool_audit
AFTER INSERT OR UPDATE OR DELETE ON attendance_pool
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER company_audit
AFTER INSERT OR UPDATE OR DELETE ON company
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER event_audit
AFTER INSERT OR UPDATE OR DELETE ON event
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER event_hosting_group_audit
AFTER INSERT OR UPDATE OR DELETE ON event_hosting_group
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER feedback_answer_option_link_audit
AFTER INSERT OR UPDATE OR DELETE ON feedback_answer_option_link
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER feedback_form
AFTER INSERT OR UPDATE OR DELETE ON feedback_form
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER feedback_form_answer_audit
AFTER INSERT OR UPDATE OR DELETE ON feedback_form_answer
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER feedback_question_audit
AFTER INSERT OR UPDATE OR DELETE ON feedback_question
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER feedback_question_answer_audit
AFTER INSERT OR UPDATE OR DELETE ON feedback_question_answer
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER feedback_question_option_audit
AFTER INSERT OR UPDATE OR DELETE ON feedback_question_option
FOR EACH ROW EXECUTE FUNCTION if_modified_func();


CREATE TRIGGER group_membership_audit
AFTER INSERT OR UPDATE OR DELETE ON group_membership
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER group_membership_role_audit
AFTER INSERT OR UPDATE OR DELETE ON group_membership_role
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER group_role_audit
AFTER INSERT OR UPDATE OR DELETE ON group_role
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER job_listing_audit
AFTER INSERT OR UPDATE OR DELETE ON job_listing
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER job_listing_location_audit
AFTER INSERT OR UPDATE OR DELETE ON job_listing_location
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER mark_audit
AFTER INSERT OR UPDATE OR DELETE ON mark
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER membership_audit
AFTER INSERT OR UPDATE OR DELETE ON membership
FOR EACH ROW EXECUTE FUNCTION if_modified_func();


CREATE TRIGGER notification_permissions_audit
AFTER INSERT OR UPDATE OR DELETE ON notification_permissions
FOR EACH ROW EXECUTE FUNCTION if_modified_func();


CREATE TRIGGER offline_audit
AFTER INSERT OR UPDATE OR DELETE ON offline
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER ow_user_audit
AFTER INSERT OR UPDATE OR DELETE ON ow_user
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER personal_mark_audit
AFTER INSERT OR UPDATE OR DELETE ON personal_mark
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER privacy_permissions_audit
AFTER INSERT OR UPDATE OR DELETE ON privacy_permissions
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER task_audit
AFTER INSERT OR UPDATE OR DELETE ON task
FOR EACH ROW EXECUTE FUNCTION if_modified_func();