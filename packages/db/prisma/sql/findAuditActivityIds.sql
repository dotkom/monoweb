-- @param {Int} $1:offset
-- @param {Int} $2:limit
-- @param {String} $3:bySearchTerm?

-- IMPORTANT: $4 (byTableName), $5 (byOperation), $6 (byUserId) are text[]. Pass empty arrays, not null.
-- Array params are not in the list above due to Prisma limitations.

WITH matching_logs AS (
  SELECT
    audit_log.id AS id,
    audit_log.created_at AS created_at,
    audit_log.audit_transaction_id AS audit_transaction_id
  FROM audit_log
  LEFT JOIN ow_user ON ow_user.id = audit_log.user_id
  WHERE $3::text IS NOT NULL
    AND btrim($3) <> ''
    AND (
      audit_log.table_name ILIKE '%' || $3 || '%'
      OR audit_log.operation ILIKE '%' || $3 || '%'
      OR ow_user.name ILIKE '%' || $3 || '%'
      OR ow_user.email ILIKE '%' || $3 || '%'
      OR (
        'system' ILIKE $3 || '%'
        AND audit_log.user_id IS NULL
      )
    )
    AND (
      cardinality($4::text[]) = 0
      OR audit_log.table_name = ANY($4)
    )
    AND (
      cardinality($5::text[]) = 0
      OR audit_log.operation = ANY($5)
    )
    AND (
      cardinality($6::text[]) = 0
      OR audit_log.user_id = ANY($6)
    )
    AND NOT (
      audit_log.operation = 'UPDATE'
      AND (audit_log.row_data - 'updated_at' - 'updatedAt') = '{}'::jsonb
    )
), matching_transactions AS (
  SELECT
    audit_transaction.id AS id,
    audit_transaction.created_at AS created_at
  FROM audit_transaction
  WHERE $3::text IS NOT NULL
    AND btrim($3) <> ''
    AND (
      audit_transaction.name ILIKE '%' || $3 || '%'
      OR audit_transaction.procedure ILIKE '%' || $3 || '%'
    )
    AND EXISTS (
      SELECT 1
      FROM audit_log
      WHERE audit_log.audit_transaction_id = audit_transaction.id
        AND (
          cardinality($4::text[]) = 0
          OR audit_log.table_name = ANY($4)
        )
        AND (
          cardinality($5::text[]) = 0
          OR audit_log.operation = ANY($5)
        )
        AND (
          cardinality($6::text[]) = 0
          OR audit_log.user_id = ANY($6)
        )
        AND NOT (
          audit_log.operation = 'UPDATE'
          AND (audit_log.row_data - 'updated_at' - 'updatedAt') = '{}'::jsonb
        )
    )
), no_search_orphans AS (
  SELECT
    audit_log.id AS id,
    audit_log.created_at AS created_at,
    'audit_log'::text AS type
  FROM audit_log
  WHERE ($3::text IS NULL OR btrim($3) = '')
    AND audit_log.audit_transaction_id IS NULL
    AND (
      cardinality($4::text[]) = 0
      OR audit_log.table_name = ANY($4)
    )
    AND (
      cardinality($5::text[]) = 0
      OR audit_log.operation = ANY($5)
    )
    AND (
      cardinality($6::text[]) = 0
      OR audit_log.user_id = ANY($6)
    )
    AND NOT (
      audit_log.operation = 'UPDATE'
      AND (audit_log.row_data - 'updated_at' - 'updatedAt') = '{}'::jsonb
    )
  ORDER BY audit_log.created_at DESC
  LIMIT ($1::int + $2::int)
), no_search_transactions AS (
  SELECT
    audit_transaction.id AS id,
    audit_transaction.created_at AS created_at,
    'audit_transaction'::text AS type
  FROM audit_transaction
  WHERE ($3::text IS NULL OR btrim($3) = '')
    AND EXISTS (
      SELECT 1
      FROM audit_log
      WHERE audit_log.audit_transaction_id = audit_transaction.id
        AND (
          cardinality($4::text[]) = 0
          OR audit_log.table_name = ANY($4)
        )
        AND (
          cardinality($5::text[]) = 0
          OR audit_log.operation = ANY($5)
        )
        AND (
          cardinality($6::text[]) = 0
          OR audit_log.user_id = ANY($6)
        )
        AND NOT (
          audit_log.operation = 'UPDATE'
          AND (audit_log.row_data - 'updated_at' - 'updatedAt') = '{}'::jsonb
        )
    )
  ORDER BY audit_transaction.created_at DESC
  LIMIT ($1::int + $2::int)
), 
-- Activities that matched the search term. Only filled when $3 (bySearchTerm) is not null.
search_activities AS (
  SELECT
    matching_logs.id AS id,
    matching_logs.created_at AS created_at,
    'audit_log'::text AS type
  FROM matching_logs
  WHERE matching_logs.audit_transaction_id IS NULL

  UNION

  SELECT DISTINCT
    matching_logs.audit_transaction_id AS id,
    audit_transaction.created_at AS created_at,
    'audit_transaction'::text AS type
  FROM matching_logs
  INNER JOIN audit_transaction
    ON audit_transaction.id = matching_logs.audit_transaction_id
  WHERE matching_logs.audit_transaction_id IS NOT NULL

  UNION

  SELECT
    matching_transactions.id AS id,
    matching_transactions.created_at AS created_at,
    'audit_transaction'::text AS type
  FROM matching_transactions
), 
-- No search: no_search_orphans and no_search_transactions.
-- Search: search_activities.
activities AS (
  SELECT id, created_at, type
  FROM no_search_orphans

  UNION ALL

  SELECT id, created_at, type
  FROM no_search_transactions

  UNION ALL

  SELECT id, created_at, type
  FROM search_activities
)
SELECT *
FROM activities
ORDER BY created_at DESC
OFFSET $1
LIMIT $2;
