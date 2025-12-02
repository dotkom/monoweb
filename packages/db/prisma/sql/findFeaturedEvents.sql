-- @param {Int} $1:offset
-- @param {Int} $2:limit

-- DOCS: https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/typedsql

-- This SQL query is used in EventRepository#findFeaturedEvents to find featured events, as this is too complex to do
-- with Prisma's normal query API.

-- Events will primarily be ranked by their type in the following order (lower number is higher ranking):
--   1. GENERAL_ASSEMBLY
--   2. COMPANY, ACADEMIC
--   3. SOCIAL, INTERNAL, OTHER, WELCOME
--
-- Within each bucket they will be ranked like this:
--   1. Event in future, registration open and not full AND attendance capacities is limited (>0)
--   2. Event in future, registration not started yet (attendance capacities does not matter)
--   3. Event in future, no attendance registration OR attendance capacities is unlimited (=0)
--   4. Event in future, registration full (registration status does not matter)
--
-- Past events are not featured. We would rather have no featured events than "stale" events.

WITH
  capacities AS (
    SELECT
      "attendanceId",
      SUM("capacity") AS sum
    FROM "attendance_pool"
    GROUP BY "attendanceId"
  ),

  attendees AS (
    SELECT
      "attendanceId",
      COUNT(*) AS count
    FROM "attendee"
    GROUP BY "attendanceId"
  )

SELECT
  "event".*,
  COALESCE(capacities.sum, 0) AS "totalCapacity",
  COALESCE(attendees.count, 0) AS "attendeeCount",

  -- 1,2,3: event type buckets
  CASE "event"."type"
    WHEN 'GENERAL_ASSEMBLY' THEN 1
    WHEN 'COMPANY'          THEN 2
    WHEN 'ACADEMIC'         THEN 2
    ELSE 3
  END AS "typeRank",

  -- 1-4: registration buckets
  CASE
    -- 1. Future, registration open and not full AND capacities limited (> 0)
    WHEN "event"."attendanceId" IS NOT NULL
      AND NOW() BETWEEN attendance."registerStart" AND attendance."registerEnd"
      AND COALESCE(capacities.sum, 0) > 0
      AND COALESCE(attendees.count, 0) < COALESCE(capacities.sum, 0)
    THEN 1

    -- 2. Future, registration not started yet (capacities doesn't matter)
    WHEN "event"."attendanceId" IS NOT NULL
      AND NOW() < attendance."registerStart"
    THEN 2

    -- 3. Future, no registration OR unlimited capacities (total capacities = 0)
    WHEN "event"."attendanceId" IS NULL
      OR COALESCE(capacities.sum, 0) = 0
    THEN 3

    -- 4. Future, registration full (status doesn't matter)
    WHEN "event"."attendanceId" IS NOT NULL
      AND COALESCE(capacities.sum, 0) > 0
      AND COALESCE(attendees.count, 0) >= COALESCE(capacities.sum, 0)
    THEN 4

    -- Fallback: treat as bucket 4
    ELSE 4
  END AS "registrationBucket"

FROM "event"
LEFT JOIN "attendance"
  ON "attendance"."id" = "event"."attendanceId"
LEFT JOIN capacities
  ON capacities."attendanceId" = "event"."attendanceId"
LEFT JOIN attendees
  ON attendees."attendanceId" = "event"."attendanceId"

WHERE
  "event"."status" = 'PUBLIC'
  -- Past events are not featured
  AND "event"."start" > NOW()

ORDER BY
  "typeRank" ASC,
  "registrationBucket" ASC,
  -- Tie breaker with earlier events first
  "event"."start" ASC

OFFSET $1
LIMIT $2;