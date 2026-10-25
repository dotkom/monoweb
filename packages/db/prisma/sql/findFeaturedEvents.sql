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
-- @param {Boolean} $18:excludeAttendedByUser

-- IMPORTANT: This expects EMPTY arrays and NOT null for array values. Giving null will break things.
-- Array params are not in the list above due to Prisma limitations.

-- DOCS: https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/typedsql

-- This SQL query is used in EventRepository#findFeaturedEvents to find featured events, as this is too complex to do
-- with Prisma's normal query API.

-- Featured events are ranked to balance relevance, urgency, and strategic importance (general assemblies and
-- company-backed events are important for the organization). Events should generally rise as they become more timely or
-- actionable, while still allowing important event types to surface even when they are further away.
--
-- Event starts, registration openings, and a last chance to register while space remains are reasons to feature an
-- event. At the same distance in time, the event start is slightly more important than registration opening.
-- Registration openings more than a week away have no opening bonus. Recently opened registrations remain prominent
-- even when popular events fill quickly.
--
-- An event's main timing score uses the higher of these two scores:
--
--   Proximity:
--     * Up to 50 points before it starts, halving every 5 days; ongoing events receive 50 points
--
--   Registration opening:
--     * Up to 48 points, rising linearly from zero 7 days before opening
--     * 48 points for all registrations during the first 6 hours after opening
--     * Registrations inferred to have filled within those 6 hours retain the bonus until 18 hours after opening,
--       or 42 hours after opening for total capacity of at least 75
--     * No opening bonus after registration ends
--
-- Filling within 6 hours is inferred from current registered attendees who joined and were eligible for reservation
-- within 6 hours of registration opening. Every pool must have finite capacity covered by those attendees.
-- This approximation can miss events that filled quickly and later had cancellations or capacity changes.
--
-- Closing bonuses are zero within 72 hours of event start and rise linearly to full strength at 7 days before start.
-- A strong registration opening score further reduces them by max(0, 1 - registration opening score / 50), preventing
-- opening and closing bonuses from stacking. This applies to both registration end urgency and company last-chance
-- points. It does not affect strategic priority or the registration end visibility floor.
--
-- Registration end urgency adds up to 8 points, scaled by the closing multiplier, to the main timing score while
-- registration is open, including when only the waiting list is available.
--
-- Registration end visibility raises the resulting timing score to at least 30 points immediately before registration
-- ends, rising linearly from zero 48 hours beforehand. This only applies while registration is open and space remains.
-- It takes over when the existing timing score is lower, so it does not stack with the smaller urgency bonus.
--
-- Additional points are added for:
--
--   Registration availability:
--     * 8 when registration is not required, has not opened, or is open with space
--     * 5 when registration is open and full, since joining the waiting list is still actionable
--     * 0 after registration ends; event proximity still keeps imminent events visible
--
--   Strategic priority:
--     * 15 flat points for general assemblies
--     * Otherwise, 8 flat points for any company-backed event, regardless of event type
--
--   Company last chance:
--     Up to 10 points for any company-backed event with open registration, rising sharply as registration end approaches.
--     Scaled by the closing multiplier, this adds to strategic priority after the timing score is determined.
--
-- Attendance records without any attendance pools are treated as if the event does not require registration.
--
-- Child events of a parent that has attendance are only featured if the viewing user is registered on that parent.
-- Parents without attendance, and events without a parent, are unaffected. Anonymous viewers never see gated children.
--
-- Events with visibility `AUTHENTICATED` are only featured to logged-in viewers.
-- Events with visibility `COMMITTEE_ONLY` are only featured to users with an active committee or node committee
-- membership.
--
-- When excludeAttendedByUser is true, events the viewing user is already registered for are omitted.
-- Anonymous viewers are unaffected.
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
      AND (cardinality($20::event_visibility[]) = 0 OR event.visibility = ANY($20))
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
        event.visibility <> 'AUTHENTICATED'
        OR $17::text IS NOT NULL
      )
      AND (
        event.visibility <> 'COMMITTEE_ONLY'
        OR (
          $17::text IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM group_membership
            INNER JOIN "group" AS member_group
              ON member_group.slug = group_membership.group_id
            WHERE
              group_membership.user_id = $17
              AND group_membership.end IS NULL
              AND member_group.type IN ('COMMITTEE', 'NODE_COMMITTEE')
          )
        )
      )
      AND (
        cardinality($15::event_type[]) = 0
        OR event.type <> ALL($15)
      )
      AND (
        cardinality($19::event_visibility[]) = 0
        OR event.visibility <> ALL($19)
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
                AND attendee.registered_at IS NOT NULL
            )
          )
      )
      AND (
        NOT $18::boolean
        OR $17::text IS NULL
        OR event.attendance_id IS NULL
        OR NOT EXISTS (
          SELECT 1
          FROM attendee
          WHERE
            attendee.attendance_id = event.attendance_id
            AND attendee.user_id = $17
        )
      )
  ),

  candidate_attendances AS (
    SELECT DISTINCT attendance_id
    FROM candidate_events
    WHERE attendance_id IS NOT NULL
  ),

  registered_attendees AS (
    SELECT
      attendee.attendance_pool_id,
      COUNT(*) AS registered_count,
      COUNT(*) FILTER (
        WHERE
          attendee.created_at <= attendance.register_start + INTERVAL '6 hours'
          AND attendee.created_at + (
            COALESCE(attendee.registration_pool_delay_hours, 0)
            + COALESCE(attendee.registration_mark_delay_hours, 0)
          ) * INTERVAL '1 hour' <= attendance.register_start + INTERVAL '6 hours'
      ) AS registered_within_six_hours_count
    FROM attendee
    INNER JOIN candidate_attendances
      ON candidate_attendances.attendance_id = attendee.attendance_id
    INNER JOIN attendance
      ON attendance.id = candidate_attendances.attendance_id
    WHERE attendee.registered_at IS NOT NULL
    GROUP BY attendee.attendance_pool_id
  ),

  attendance_availability AS (
    SELECT
      attendance_pool.attendance_id,
      SUM(attendance_pool.capacity) AS total_capacity,
      BOOL_OR(
        attendance_pool.capacity = 0
        OR COALESCE(registered_attendees.registered_count, 0) < attendance_pool.capacity
      ) AS has_available_pool,
      BOOL_AND(
        attendance_pool.capacity > 0
        AND COALESCE(registered_attendees.registered_within_six_hours_count, 0) >= attendance_pool.capacity
      ) AS filled_within_six_hours
    FROM attendance_pool
    INNER JOIN candidate_attendances
      ON candidate_attendances.attendance_id = attendance_pool.attendance_id
    LEFT JOIN registered_attendees
      ON registered_attendees.attendance_pool_id = attendance_pool.id
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
      COALESCE(attendance_availability.total_capacity, 0) AS total_attendance_capacity,
      COALESCE(attendance_availability.filled_within_six_hours, FALSE) AS filled_within_six_hours,

      EXISTS (
        SELECT 1
        FROM event_company
        WHERE event_company.event_id = candidate_events.id
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
        EXTRACT(EPOCH FROM (NOW() - attendance.register_start)) / 86400.0,
        0
      ) AS days_since_registration_opened,

      GREATEST(
        EXTRACT(EPOCH FROM (attendance.register_end - NOW())) / 86400.0,
        0
      ) AS days_until_registration_end

    FROM candidate_events

    LEFT JOIN attendance
      ON attendance.id = candidate_events.attendance_id

    LEFT JOIN attendance_availability
      ON attendance_availability.attendance_id = candidate_events.attendance_id
  ),

  score_components AS (
    SELECT
      event_features.*,

      -- 50 points if the event starts now, halving every 5 days
      CASE
        WHEN NOW() >= start THEN 50.0 -- Event is ongoing
        ELSE 50.0 * POWER(2.0, -days_until_event / 5.0)
      END AS proximity_score,

      -- Registration openings receive no bonus more than a week ahead.
      -- Every registration gets the peak for the first 6 hours; fast-filling registrations retain it afterward.
      -- Cut off after 18 hours, extended to 42 hours for total capacity of at least 75; no fading afterward.
      CASE
        WHEN NOT has_attendance OR NOW() >= register_end THEN 0.0
        WHEN NOW() < register_start
          THEN 48.0 * GREATEST(1.0 - days_until_registration_opens / 7.0, 0.0)
        WHEN days_since_registration_opened < 6.0 / 24.0 THEN 48.0
        WHEN NOT filled_within_six_hours THEN 0.0
        WHEN total_attendance_capacity >= 75 AND days_since_registration_opened < 42.0 / 24.0 THEN 48.0
        WHEN days_since_registration_opened < 18.0 / 24.0 THEN 48.0
        ELSE 0.0
      END AS registration_opening_score,

      -- Joining the waiting list is still actionable, so a full event only loses 3 availability points.
      -- Registration end removes all availability points.
      -- Attendance without any pools is treated as no registration required.
      CASE
        WHEN NOT has_attendance THEN 8.0
        WHEN NOW() >= register_end THEN 0.0
        WHEN NOW() < register_start OR has_available_pool THEN 8.0
        ELSE 5.0
      END AS registration_score,

      -- Up to 8 points before tapering if registration is open, doubling every 2 days until the registration end
      -- 0 points after registration ends or when no usable attendance exists
      CASE
        WHEN has_attendance
          AND NOW() >= register_start
          AND NOW() < register_end
          THEN 8.0 * POWER(2.0, -days_until_registration_end / 2.0)
        ELSE 0.0
      END AS registration_end_score,

      -- A visibility floor rising from 0 to 30 points during the final 48 hours, only while space remains.
      -- This competes with the existing timing score including its smaller registration-end urgency bonus.
      CASE
        WHEN has_attendance
          AND NOW() >= register_start
          AND NOW() < register_end
          AND has_available_pool
          THEN 30.0 * GREATEST(1.0 - days_until_registration_end / 2.0, 0.0)
        ELSE 0.0
      END AS registration_end_visibility_score,

      -- 15 flat points for general assemblies
      -- Otherwise, 8 flat points for any company-backed event
      CASE
        WHEN type = 'GENERAL_ASSEMBLY' THEN 15.0
        WHEN is_company_backed THEN 8.0
        ELSE 0.0
      END AS strategic_priority_score,

      -- Up to 10 points before tapering if a company-backed event is open for registration, including its waiting list
      CASE
        WHEN is_company_backed
          AND has_attendance
          AND NOW() >= register_start
          AND NOW() < register_end
          THEN 10.0 * POWER(4.0, -days_until_registration_end / 2.0)
        ELSE 0.0
      END AS company_last_chance_score

    FROM event_features
  ),

  scoring_factors AS (
    SELECT
      score_components.*,

      GREATEST(proximity_score, registration_opening_score) AS timing_score,

      -- Event proximity already supplies visibility within 72 hours; reserve closing bonuses for later events.
      LEAST(
        GREATEST((days_until_event - 3.0) / 4.0, 0.0),
        1.0
      ) * GREATEST(1.0 - registration_opening_score / 50.0, 0.0) AS closing_multiplier

    FROM score_components
  ),

  scored_events AS (
    SELECT
      scoring_factors.*,

      GREATEST(
        timing_score + registration_end_score * closing_multiplier,
        registration_end_visibility_score
      )
        + registration_score
        + strategic_priority_score
        + company_last_chance_score * closing_multiplier AS featured_score

    FROM scoring_factors
  )

SELECT *
FROM scored_events
ORDER BY
  featured_score DESC,
  start ASC,
  id ASC
OFFSET $1
LIMIT $2;
