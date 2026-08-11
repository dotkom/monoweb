CREATE TRIGGER notification_audit
AFTER INSERT OR UPDATE OR DELETE ON notification
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER contest_audit
AFTER INSERT OR UPDATE OR DELETE ON contest
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER contestant_audit
AFTER INSERT OR UPDATE OR DELETE ON contestant
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER contest_team_audit
AFTER INSERT OR UPDATE OR DELETE ON contest_team
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER fadderuke_audit
AFTER INSERT OR UPDATE OR DELETE ON fadderuke
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE TRIGGER temporary_fadderuke_contest_profile_progress_audit
AFTER INSERT OR UPDATE OR DELETE ON temporary_fadderuke_contest_profile_progress
FOR EACH ROW EXECUTE FUNCTION if_modified_func();
