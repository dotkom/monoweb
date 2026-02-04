CREATE TRIGGER mark_group_audit
AFTER INSERT OR UPDATE OR DELETE ON mark_group
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER article_tag_audit
AFTER INSERT OR UPDATE OR DELETE ON article_tag
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER article_tag_link_audit
AFTER INSERT OR UPDATE OR DELETE ON article_tag_link
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER attendance_audit
AFTER INSERT OR UPDATE OR DELETE ON attendance
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER deregister_reason_audit
AFTER INSERT OR UPDATE OR DELETE ON deregister_reason
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER event_company_audit
AFTER INSERT OR UPDATE OR DELETE ON event_company
FOR EACH ROW EXECUTE FUNCTION if_modified_func();
