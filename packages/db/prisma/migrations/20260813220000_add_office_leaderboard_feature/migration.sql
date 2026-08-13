INSERT INTO "feature" ("key", "enabled", "configuration")
VALUES ('office-leaderboard', true, '{}')
ON CONFLICT ("key") DO NOTHING;
