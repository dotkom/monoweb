-- CreateTable
CREATE TABLE "feature" (
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "starts_at" TIMESTAMPTZ(3),
    "ends_at" TIMESTAMPTZ(3),
    "configuration" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feature_pkey" PRIMARY KEY ("key")
);

-- Seed the supported front-page features with their current behavior.
INSERT INTO "feature" ("key", "enabled", "starts_at", "ends_at", "configuration")
VALUES
    ('fadderuke-2026-notice', true, '2026-07-01T00:00:00+02:00', '2026-08-23T23:59:59+02:00', '{}'),
    ('front-page-notice', false, NULL, NULL, '{"text":""}');

-- Audit dashboard changes to feature configuration.
CREATE TRIGGER feature_audit
AFTER INSERT OR UPDATE OR DELETE ON feature
FOR EACH ROW EXECUTE FUNCTION if_modified_func();
