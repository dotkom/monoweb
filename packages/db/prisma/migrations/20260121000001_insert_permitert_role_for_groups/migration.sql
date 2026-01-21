-- Insert "Permitert" role for all existing groups
INSERT INTO group_role (id, name, type, group_id)
SELECT gen_random_uuid(), 'Permitert', 'TEMPORARILY_LEAVE', slug
FROM "group"
ON CONFLICT (group_id, name) DO NOTHING;
