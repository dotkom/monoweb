CREATE TABLE "event_featured_priority" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_id" TEXT NOT NULL,
    "last_updated_by_user_id" TEXT,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    CONSTRAINT "event_featured_priority_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_featured_priority_last_updated_by_user_id_fkey" FOREIGN KEY ("last_updated_by_user_id") REFERENCES "ow_user"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TRIGGER event_featured_priority_audit
AFTER INSERT OR UPDATE OR DELETE ON event_featured_priority
FOR EACH ROW EXECUTE FUNCTION if_modified_func();

CREATE INDEX "event_featured_priority_last_updated_by_user_id_idx" ON "event_featured_priority"("last_updated_by_user_id");

CREATE INDEX "event_featured_priority_event_id_expires_at_idx" ON "event_featured_priority"("event_id", "expires_at");
