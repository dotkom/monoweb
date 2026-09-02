-- @param {Int} $1:offset
-- @param {Int} $2:limit
-- @param {DateTime} $4:byStartDateMin?
-- @param {DateTime} $5:byStartDateMax?
-- @param {DateTime} $6:byEndDateMin?
-- @param {DateTime} $7:byEndDateMax?
-- @param {String} $8:bySearchTerm?
-- @param {Boolean} $11:excludingChildEvents
-- @param {Boolean} $16:byHasFeedbackForm?
-- @param {String} $17:userId?

-- IMPORTANT: This expects EMPTY arrays and NOT null for array values. Giving null will break things.
-- Array params are not in the list above due to Prisma limitations.

-- DOCS: https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/typedsql

-- This SQL query is used in EventRepository#findFeaturedEvents to find featured events, as this is too complex to do
-- with Prisma's normal query API.

-- Featured events are ranked to balance relevance, urgency, and strategic importance (general assemblies and
-- company-backed events are important for the organization). Events should generally rise as they become more timely or
-- actionable, while still allowing important event types to surface even when they are further away.
--
-- The scoring is designed so that registration availability matters, approaching deadlines create urgency, and
-- proximity becomes increasingly important as the event gets closer. Events that can no longer be acted on are
-- deprioritized, while events without meaningful registration requirements are treated neutrally rather than penalized.
--
-- An event's featured score is the sum of:
--
--   Proximity:
--     * Up to 50 points before it starts, halving every 7 days
--
--   Registration:
--     a) 28 for open registration with space
--     b) 24 when registration is not required
--     c) 10 when full
--     d) 8 when closed
--     e) up to 20 while waiting for registration to open
--
--   Registration deadline:
--     Up to 8 points when registration is open and space remains.
--
--   Strategic priority:
--     * 15 flat points for general assemblies
--     * 6 flat points for company-backed company or academic events
--
--   Company last chance:
--     Up to 10 points, rising sharply as the registration deadline approaches.
--
-- Attendance records without any attendance pools are treated as if the event does not require registration.
--
-- Child events of a parent that has attendance are only featured if the viewing user is reserved on that parent.
-- Parents without attendance, and events without a parent, are unaffected. Anonymous viewers never see gated children.
--
-- Events that have ended are not featured.

WITH
  candidate_events AS (
    SELECT *
    FROM event
    WHERE
      event.status = ANY($3::event_status[])
      AND event.end > NOW()
      AND ($4::timestamptz IS NULL OR event.start >= $4)
      AND ($5::timestamptz IS NULL OR event.start <= $5)
      AND ($6::timestamptz IS NULL OR event.end >= $6)
      AND ($7::timestamptz IS NULL OR event.end <= $7)
      AND ($8::text IS NULL OR event.title ILIKE '%' || $8 || '%')
      AND (cardinality($9::text[]) = 0 OR event.id = ANY($9))
      AND (cardinality($10::event_type[]) = 0 OR event.type = ANY($10))
      AND (NOT $11::boolean OR event.parent_id IS NULL)
      AND (
        (
          cardinality($12::text[]) = 0
          AND cardinality($13::text[]) = 0
        )
        OR EXISTS (
          SELECT 1
          FROM event_company
          WHERE
            event_company.event_id = event.id
            AND event_company.company_id = ANY($12)
        )
        OR EXISTS (
          SELECT 1
          FROM event_hosting_group
          WHERE
            event_hosting_group.event_id = event.id
            AND event_hosting_group.group_id = ANY($13)
        )
      )
      AND (
        cardinality($14::text[]) = 0
        OR NOT EXISTS (
          SELECT 1
          FROM event_hosting_group
          WHERE
            event_hosting_group.event_id = event.id
            AND event_hosting_group.group_id = ANY($14)
        )
      )
      AND (
        cardinality($15::event_type[]) = 0
        OR event.type <> ALL($15)
      )
      AND (
        $16::boolean IS NULL
        OR $16 = EXISTS (
          SELECT 1
          FROM feedback_form
          WHERE feedback_form.event_id = event.id
        )
      )
      AND NOT EXISTS (
        SELECT 1
        FROM event AS parent_event
        WHERE
          parent_event.id = event.parent_id
          AND parent_event.attendance_id IS NOT NULL
          AND (
            $17::text IS NULL
            OR NOT EXISTS (
              SELECT 1
              FROM attendee
              WHERE
                attendee.attendance_id = parent_event.attendance_id
                AND attendee.user_id = $17
                AND attendee.reserved = TRUE
            )
          )
      )
  ),

  candidate_attendances AS (
    SELECT DISTINCT attendance_id
    FROM candidate_events
    WHERE attendance_id IS NOT NULL
  ),

  reserved_attendees AS (
    SELECT
      attendee.attendance_pool_id,
      COUNT(*) AS reserved_count
    FROM attendee
    INNER JOIN candidate_attendances
      ON candidate_attendances.attendance_id = attendee.attendance_id
    WHERE attendee.reserved = TRUE
    GROUP BY attendee.attendance_pool_id
  ),

  attendance_availability AS (
    SELECT
      attendance_pool.attendance_id,
      BOOL_OR(
        attendance_pool.capacity = 0
        OR COALESCE(reserved_attendees.reserved_count, 0) < attendance_pool.capacity
      ) AS has_available_pool
    FROM attendance_pool
    INNER JOIN candidate_attendances
      ON candidate_attendances.attendance_id = attendance_pool.attendance_id
    LEFT JOIN reserved_attendees
      ON reserved_attendees.attendance_pool_id = attendance_pool.id
    GROUP BY attendance_pool.attendance_id
  ),

  event_features AS (
    SELECT
      candidate_events.*,

      (
        candidate_events.attendance_id IS NOT NULL
        AND attendance_availability.attendance_id IS NOT NULL
      ) AS has_attendance,

      attendance.register_start,
      attendance.register_end,
      COALESCE(attendance_availability.has_available_pool, FALSE) AS has_available_pool,

      (
        candidate_events.type IN ('COMPANY', 'ACADEMIC')
        AND EXISTS (
          SELECT 1
          FROM event_company
          WHERE event_company.event_id = candidate_events.id
        )
      ) AS is_company_backed,

      GREATEST(
        EXTRACT(EPOCH FROM (candidate_events.start - NOW())) / 86400.0,
        0
      ) AS days_until_event,

      GREATEST(
        EXTRACT(EPOCH FROM (attendance.register_start - NOW())) / 86400.0,
        0
      ) AS days_until_registration_opens,

      GREATEST(
        EXTRACT(EPOCH FROM (attendance.register_end - NOW())) / 86400.0,
        0
      ) AS days_until_registration_closes

    FROM candidate_events

    LEFT JOIN attendance
      ON attendance.id = candidate_events.attendance_id

    LEFT JOIN attendance_availability
      ON attendance_availability.attendance_id = candidate_events.attendance_id
  ),

  score_components AS (
    SELECT
      event_features.*,

      -- 50 points if the event starts now, halving every 7 days
      CASE
        WHEN NOW() >= start THEN 50.0 -- Event is ongoing
        ELSE 50.0 * POWER(2.0, -days_until_event / 7.0)
      END AS proximity_score,

      -- 24 points if no registration is required, including attendance without any attendance pools
      -- 20 points if registration is not yet open, halving every 7 days
      -- 28 points if registration is open and space is available
      -- 10 points if registration is open and full
      -- 8 points if registration is closed
      CASE
        WHEN NOT has_attendance THEN 24.0
        WHEN NOW() < register_start
          THEN 20.0 * POWER(2.0, -days_until_registration_opens / 7.0)
        WHEN NOW() < register_end AND has_available_pool THEN 28.0
        WHEN NOW() < register_end THEN 10.0
        ELSE 8.0
      END AS registration_score,

      -- 8 points if registration is open and space is available, doubling every 2 days until the registration end
      -- 0 points if registration is closed or no usable attendance exists
      CASE
        WHEN has_attendance
          AND NOW() >= register_start
          AND NOW() < register_end
          AND has_available_pool
          THEN 8.0 * POWER(2.0, -days_until_registration_closes / 2.0)
        ELSE 0.0
      END AS registration_deadline_score,

      -- 15 flat points for general assemblies
      -- 6 flat points for company-backed company or academic events
      CASE
        WHEN type = 'GENERAL_ASSEMBLY' THEN 15.0
        WHEN is_company_backed THEN 6.0
        ELSE 0.0
      END AS strategic_priority_score,

      -- Up to 10 points if a company-backed event is open for registration and has space available before the
      -- registration end
      CASE
        WHEN is_company_backed
          AND has_attendance
          AND NOW() >= register_start
          AND NOW() < register_end
          AND has_available_pool
          THEN 10.0 * POWER(4.0, -days_until_registration_closes / 2.0)
        ELSE 0.0
      END AS company_last_chance_score

    FROM event_features
  ),

  scored_events AS (
    SELECT
      score_components.*,

      proximity_score
        + registration_score
        + registration_deadline_score
        + strategic_priority_score
        + company_last_chance_score AS featured_score

    FROM score_components
  )

SELECT *
FROM scored_events
ORDER BY
  featured_score DESC,
  start ASC,
  id ASC
OFFSET $1
LIMIT $2;
