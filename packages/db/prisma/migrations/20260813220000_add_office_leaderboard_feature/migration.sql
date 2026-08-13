INSERT INTO "feature" ("key", "enabled", "configuration")
VALUES ('office-leaderboard', false, '{}')
ON CONFLICT ("key") DO NOTHING;
