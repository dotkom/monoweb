import type { DBHandle, Prisma } from "@dotkomonline/db"
import {
  type AttendanceId,
  type BaseEvent,
  BaseEventSchema,
  type CompanyId,
  type DeregisterReason,
  DeregisterReasonSchema,
  type DeregisterReasonWithEvent,
  DeregisterReasonWithEventSchema,
  type DeregisterReasonWrite,
  type Event,
  type EventFilterQuery,
  type EventId,
  EventSchema,
  type EventWrite,
  type GroupId,
  snakeCaseToCamelCase,
  type UserId,
} from "@dotkomonline/types"
import { getCurrentUTC } from "@dotkomonline/utils"
import invariant from "tiny-invariant"
import { parseOrReport } from "../../invariant"
import { type Pageable, pageQuery } from "../../query"
import z from "zod"

const INCLUDE_COMPANY_AND_GROUPS = {
  companies: {
    include: {
      company: true,
    },
  },
  hostingGroups: {
    include: {
      group: {
        include: {
          roles: true,
        },
      },
    },
  },
} as const satisfies Prisma.EventInclude

export interface EventRepository {
  create(handle: DBHandle, data: EventWrite): Promise<Event>
  update(handle: DBHandle, eventId: EventId, data: Partial<EventWrite>): Promise<Event>
  updateEventAttendance(handle: DBHandle, eventId: EventId, attendanceId: AttendanceId): Promise<Event>
  updateEventParent(handle: DBHandle, eventId: EventId, parentEventId: EventId | null): Promise<Event>
  /**
   * Soft-delete an event by setting its status to "DELETED".
   */
  delete(handle: DBHandle, eventId: EventId): Promise<Event>
  findById(handle: DBHandle, eventId: EventId, options?: { includeDeleted?: boolean }): Promise<Event | null>
  findByAttendanceId(handle: DBHandle, attendanceId: AttendanceId): Promise<Event | null>
  /**
   * Find events based on a set of search criteria.
   *
   * You can query events by their IDs (for multiple events), start date range, search term, event type, and the companies or groups organizing the event.
   *
   * The following describes the filters in a "predicate logic" style:
   *
   * @example
   * ```ts
   * AND(
   *   id IN byId,
   *   start >= byStartDate.min,
   *   start <= byStartDate.max,
   *   title CONTAINS bySearchTerm,
   *   type IN byEventType,
   *   OR(
   *     companies.companyId IN byOrganizingCompany,
   *     hostingGroups.groupId IN byOrganizingGroup
   *   )
   * )
   * ```
   *
   * NOTE: Yes, this is a monster query, but if - a future developer find it slow, you should probably look into finding
   * the right indexing strategy rather than rewrite or split up this query. OnlineWeb has relatively little data, and
   * as such this query should be performant enough with good indexing.
   */
  findMany(handle: DBHandle, query: EventFilterQuery, page: Pageable): Promise<Event[]>
  findByAttendingUserId(
    handle: DBHandle,
    attendingUserId: UserId,
    query: EventFilterQuery,
    page: Pageable
  ): Promise<Event[]>
  findByParentEventId(handle: DBHandle, parentEventId: EventId): Promise<Event[]>
  findEventsWithUnansweredFeedbackFormByUserId(handle: DBHandle, userId: UserId): Promise<Event[]>
  findManyDeregisterReasonsWithEvent(handle: DBHandle, page: Pageable): Promise<DeregisterReasonWithEvent[]>
  // This cannot use `Pageable` due to raw query needing numerical offset and not cursor based pagination
  findFeaturedEvents(handle: DBHandle, offset: number, limit: number): Promise<BaseEvent[]>

  addEventHostingGroups(handle: DBHandle, eventId: EventId, hostingGroupIds: Set<GroupId>): Promise<void>
  deleteEventHostingGroups(handle: DBHandle, eventId: EventId, hostingGroupIds: Set<GroupId>): Promise<void>
  addEventCompanies(handle: DBHandle, eventId: EventId, companyIds: Set<CompanyId>): Promise<void>
  deleteEventCompanies(handle: DBHandle, eventId: EventId, companyIds: Set<CompanyId>): Promise<void>

  createDeregisterReason(handle: DBHandle, data: DeregisterReasonWrite): Promise<DeregisterReason>
}

export function getEventRepository(): EventRepository {
  return {
    async create(handle, data) {
      const row = await handle.event.create({ data })
      const event = await this.findById(handle, row.id)
      invariant(event !== null, "Event should exist within same transaction after creation")
      return event
    },

    async update(handle, eventId, data) {
      const row = await handle.event.update({
        where: { id: eventId },
        data,
      })
      const event = await this.findById(handle, row.id)
      invariant(event !== null, "Event should exist within same transaction after update")
      return event
    },

    async delete(handle, eventId) {
      const row = await handle.event.update({
        where: { id: eventId },
        data: { status: "DELETED" },
      })
      const event = await this.findById(handle, row.id, { includeDeleted: true })
      invariant(event !== null, "Event should exist within same transaction after deletion")
      return event
    },

    async findMany(handle, query, page) {
      const events = await handle.event.findMany({
        ...pageQuery(page),
        orderBy: { start: query.orderBy ?? "desc" },
        where: {
          AND: [
            {
              status: query.byStatus?.length
                ? {
                    in: query.byStatus,
                  }
                : "PUBLIC",
              start: {
                gte: query.byStartDate?.min ?? undefined,
                lte: query.byStartDate?.max ?? undefined,
              },
              end: {
                gte: query.byEndDate?.min ?? undefined,
                lte: query.byEndDate?.max ?? undefined,
              },
              title:
                query.bySearchTerm !== null
                  ? {
                      contains: query.bySearchTerm,
                      mode: "insensitive",
                    }
                  : undefined,
              id:
                query.byId && query.byId.length > 0
                  ? {
                      in: query.byId,
                    }
                  : undefined,
              type:
                query.byType && query.byType.length > 0
                  ? {
                      in: query.byType,
                    }
                  : undefined,
            },
            {
              OR: [
                {
                  companies:
                    query.byOrganizingCompany && query.byOrganizingCompany.length > 0
                      ? { some: { companyId: { in: query.byOrganizingCompany } } }
                      : undefined,
                },
                {
                  hostingGroups:
                    query.byOrganizingGroup && query.byOrganizingGroup.length > 0
                      ? { some: { groupId: { in: query.byOrganizingGroup } } }
                      : undefined,
                },
              ],
            },
            {
              hostingGroups: query.excludingOrganizingGroup
                ? {
                    none: {
                      groupId: { in: query.excludingOrganizingGroup },
                    },
                  }
                : undefined,
              type: {
                notIn: query.excludingType ?? ["INTERNAL"],
              },
            },
            {
              feedbackForm: query.byHasFeedbackForm
                ? {
                    isNot: null,
                  }
                : query.byHasFeedbackForm === false
                  ? {
                      is: null,
                    }
                  : undefined,
            },
          ],
        },
        include: INCLUDE_COMPANY_AND_GROUPS,
      })

      return events.map((event) =>
        parseOrReport(EventSchema, {
          ...event,
          companies: event.companies.map((c) => c.company),
          hostingGroups: event.hostingGroups.map((g) => g.group),
        })
      )
    },

    async findByParentEventId(handle, parentEventId) {
      const events = await handle.event.findMany({
        where: {
          parentId: parentEventId,
          status: "PUBLIC",
        },
        include: {
          companies: {
            include: {
              company: true,
            },
          },
          hostingGroups: {
            include: {
              group: {
                include: {
                  roles: true,
                },
              },
            },
          },
        },
      })
      return events.map((event) =>
        parseOrReport(EventSchema, {
          ...event,
          companies: event.companies.map((c) => c.company),
          hostingGroups: event.hostingGroups.map((g) => g.group),
        })
      )
    },

    async findById(handle, eventId, { includeDeleted = false } = {}) {
      const event = await handle.event.findUnique({
        where: {
          id: eventId,
          status: includeDeleted ? undefined : { not: "DELETED" },
        },
        include: INCLUDE_COMPANY_AND_GROUPS,
      })
      if (event === null) {
        return null
      }
      return parseOrReport(EventSchema, {
        ...event,
        companies: event?.companies.map((c) => c.company) ?? [],
        hostingGroups: event?.hostingGroups.map((g) => g.group) ?? [],
      })
    },

    async findByAttendanceId(handle, attendanceId) {
      const event = await handle.event.findFirst({
        where: { attendanceId, status: { not: "DELETED" } },
        include: INCLUDE_COMPANY_AND_GROUPS,
      })
      if (event === null) {
        return null
      }
      return parseOrReport(EventSchema, {
        ...event,
        companies: event?.companies.map((c) => c.company) ?? [],
        hostingGroups: event?.hostingGroups.map((g) => g.group) ?? [],
      })
    },

    async findByAttendingUserId(handle, userId, query, page) {
      const attendees = await handle.attendee.findMany({
        where: {
          userId,
        },
        include: {
          attendance: {
            include: {
              events: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      })
      if (attendees.length === 0) {
        return []
      }
      const eventIds = attendees.flatMap((attendee) => attendee.attendance.events.map((event) => event.id))
      return this.findMany(
        handle,
        {
          ...query,
          byId: eventIds.concat(...(query.byId ?? [])),
        },
        page
      )
    },

    async findFeaturedEvents(handle, offset, limit) {
      /*
        Events will primarily be ranked by their type in the following order (lower number is higher ranking):
          1. GENERAL_ASSEMBLY
          2. COMPANY, ACADEMIC
          3. SOCIAL, INTERNAL, OTHER, WELCOME

        Within each bucket they will be ranked like this (lower number is higher ranking):
          1. Event in future, registration open and not full, AND attendance capacity is limited (>0)
          2. Event in future, AND registration not started yet (attendance capacity does not matter)
          3. Event in future, AND (no attendance registration OR attendance capacity is unlimited (=0))
          4. Event in future, AND registration full (registration status (open/closed etc.) does not matter)

        Past events are not featured. We would rather have no featured events than "stale" events.
       */

      const events = await handle.$queryRaw`
        WITH
          capacities AS (
            SELECT
              attendance_id,
              SUM("capacity") AS sum
            FROM attendance_pool
            GROUP BY attendance_id
          ),
          attendees AS (
            SELECT
              attendance_id,
              COUNT(*) AS count
            FROM attendee
            GROUP BY attendance_id
          )
        SELECT
          event.*,
          COALESCE(capacities.sum, 0) AS total_capacity,
          COALESCE(attendees.count, 0) AS attendee_count,
          -- 1,2,3: event type buckets
          CASE event.type
            WHEN 'GENERAL_ASSEMBLY' THEN 1
            WHEN 'COMPANY'          THEN 2
            WHEN 'ACADEMIC'         THEN 2
            ELSE 3
          END AS type_rank,
          -- 1-4: registration buckets
          CASE
            -- 1. Future, registration open and not full AND capacities limited (> 0)
            WHEN event.attendance_id IS NOT NULL
              AND NOW() BETWEEN attendance.register_start AND attendance.register_end
              AND COALESCE(capacities.sum, 0) > 0
              AND COALESCE(attendees.count, 0) < COALESCE(capacities.sum, 0)
            THEN 1
            -- 2. Future, registration not started yet (capacities doesn't matter)
            WHEN event.attendance_id IS NOT NULL
              AND NOW() < attendance.register_start
            THEN 2
            -- 3. Future, no registration OR unlimited capacities (total capacities = 0)
            WHEN event.attendance_id IS NULL
              OR COALESCE(capacities.sum, 0) = 0
            THEN 3
            -- 4. Future, registration full (status doesn't matter)
            WHEN event.attendance_id IS NOT NULL
              AND COALESCE(capacities.sum, 0) > 0
              AND COALESCE(attendees.count, 0) >= COALESCE(capacities.sum, 0)
            THEN 4
            -- Fallback: treat as bucket 4
            ELSE 4
          END AS registration_bucket
        FROM event
        LEFT JOIN attendance
          ON attendance.id = event.attendance_id
        LEFT JOIN capacities
          ON capacities.attendance_id = event.attendance_id
        LEFT JOIN attendees
          ON attendees.attendance_id = event.attendance_id
        WHERE
          event.status = 'PUBLIC'
          -- Past events are not featured
          AND event.start > NOW()
        ORDER BY
          type_rank ASC,
          registration_bucket ASC,
          -- Tiebreaker with earlier events first
          event.start ASC
        OFFSET ${offset}
        LIMIT ${limit};
      `

      return parseOrReport(
        z.preprocess((data) => snakeCaseToCamelCase(data), BaseEventSchema.array()),
        events
      )
    },

    async addEventHostingGroups(handle, eventId, hostingGroupIds) {
      await handle.eventHostingGroup.createMany({
        data: hostingGroupIds
          .values()
          .map((groupId) => ({ eventId, groupId }))
          .toArray(),
      })
    },

    async addEventCompanies(handle, eventId, companyIds) {
      await handle.eventCompany.createMany({
        data: companyIds
          .values()
          .map((companyId) => ({ eventId, companyId }))
          .toArray(),
      })
    },

    async deleteEventHostingGroups(handle, eventId, hostingGroupIds) {
      await handle.eventHostingGroup.deleteMany({
        where: {
          eventId,
          groupId: { in: Array.from(hostingGroupIds.values()) },
        },
      })
    },

    async deleteEventCompanies(handle, eventId, companyIds) {
      await handle.eventCompany.deleteMany({
        where: {
          eventId,
          companyId: { in: Array.from(companyIds.values()) },
        },
      })
    },

    async updateEventAttendance(handle, eventId, attendanceId) {
      const row = await handle.event.update({
        where: { id: eventId },
        data: { attendanceId },
      })
      const event = await this.findById(handle, row.id)
      invariant(event !== null, "Event should exist within same transaction after updating attendance")
      return event
    },

    async updateEventParent(handle, eventId, parentEventId) {
      const row = await handle.event.update({
        where: { id: eventId },
        data: { parentId: parentEventId },
      })
      const event = await this.findById(handle, row.id)
      invariant(event !== null, "Event should exist within same transaction after updating parent")
      return event
    },

    async findEventsWithUnansweredFeedbackFormByUserId(handle, userId) {
      const now = getCurrentUTC()

      const events = await handle.event.findMany({
        where: {
          AND: [
            {
              feedbackForm: {
                answerDeadline: {
                  gte: now,
                },
                answers: {
                  none: {
                    attendee: {
                      userId,
                    },
                  },
                },
              },
            },
            {
              attendance: {
                attendees: {
                  some: {
                    userId,
                    attendedAt: {
                      not: null,
                    },
                  },
                },
              },
              end: {
                lt: now,
              },
            },
          ],
        },
        include: INCLUDE_COMPANY_AND_GROUPS,
      })

      return events.map((event) =>
        parseOrReport(EventSchema, {
          ...event,
          companies: event.companies.map((c) => c.company),
          hostingGroups: event.hostingGroups.map((g) => g.group),
        })
      )
    },

    async createDeregisterReason(handle, data) {
      const row = await handle.deregisterReason.create({
        data,
      })

      return parseOrReport(DeregisterReasonSchema, row)
    },

    async findManyDeregisterReasonsWithEvent(handle, page) {
      const rows = await handle.deregisterReason.findMany({
        ...pageQuery(page),
        orderBy: { createdAt: "desc" },
        include: {
          event: {
            include: INCLUDE_COMPANY_AND_GROUPS,
          },
        },
      })

      return rows.map((row) => {
        const { event, ...rest } = row
        const deregisterReason = {
          event: {
            ...event,
            companies: event.companies.map((c) => c.company),
            hostingGroups: event.hostingGroups.map((g) => g.group),
          },
          ...rest,
        }

        return parseOrReport(DeregisterReasonWithEventSchema, deregisterReason)
      })
    },
  }
}
