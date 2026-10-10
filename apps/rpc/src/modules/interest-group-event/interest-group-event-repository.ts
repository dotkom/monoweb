import type { DBHandle, Prisma } from "@dotkomonline/db"
import { pageQuery, type Pageable } from "@dotkomonline/utils"
import invariant from "tiny-invariant"
import { parseOrReport } from "../../invariant"
import type { UserId } from "../user/user"
import {
  InterestGroupEventRegistrationSchema,
  InterestGroupEventSummarySchema,
  type InterestGroupEventFilterQuery,
  type InterestGroupEventId,
  type InterestGroupEventRegistration,
  type InterestGroupEventRegistrationId,
  type InterestGroupEventSummary,
  type InterestGroupEventWrite,
} from "./interest-group-event"

export interface InterestGroupEventRepository {
  create(handle: DBHandle, data: InterestGroupEventWrite): Promise<InterestGroupEventSummary>
  update(
    handle: DBHandle,
    id: InterestGroupEventId,
    data: Partial<InterestGroupEventWrite>
  ): Promise<InterestGroupEventSummary>
  findById(handle: DBHandle, id: InterestGroupEventId, includeUsers: boolean): Promise<InterestGroupEventSummary | null>
  findMany(
    handle: DBHandle,
    query: InterestGroupEventFilterQuery,
    page: Pageable,
    includeUsers: boolean
  ): Promise<InterestGroupEventSummary[]>

  createRegistration(
    handle: DBHandle,
    interestGroupEventId: InterestGroupEventId,
    userId: UserId
  ): Promise<InterestGroupEventRegistration>
  deleteRegistration(handle: DBHandle, interestGroupEventId: InterestGroupEventId, userId: UserId): Promise<void>
  findRegistrationById(
    handle: DBHandle,
    id: InterestGroupEventRegistrationId
  ): Promise<InterestGroupEventRegistration | null>
  findRegistrations(
    handle: DBHandle,
    interestGroupEventId: InterestGroupEventId
  ): Promise<InterestGroupEventRegistration[]>
}

export function getInterestGroupEventRepository(): InterestGroupEventRepository {
  return {
    async create(handle, data) {
      const row = await handle.interestGroupEvent.create({
        data,
        include: getInterestGroupEventInclude(false),
      })

      return parseOrReport(InterestGroupEventSummarySchema, toInterestGroupEventSummary(row))
    },

    async update(handle, id, data) {
      const row = await handle.interestGroupEvent.update({
        where: { id },
        data,
        include: getInterestGroupEventInclude(false),
      })

      return parseOrReport(InterestGroupEventSummarySchema, toInterestGroupEventSummary(row))
    },

    async findById(handle, id, includeUsers) {
      const row = await handle.interestGroupEvent.findUnique({
        where: { id, status: { not: "DELETED" } },
        include: getInterestGroupEventInclude(includeUsers),
      })

      if (row === null) {
        return null
      }

      return parseOrReport(InterestGroupEventSummarySchema.nullable(), toInterestGroupEventSummary(row))
    },

    async findMany(handle, query, page, includeUsers) {
      const rows = await handle.interestGroupEvent.findMany({
        where: getInterestGroupEventWhere(query),
        include: getInterestGroupEventInclude(includeUsers),
        ...pageQuery(page),
        orderBy: {
          start: query.orderBy ?? "desc",
        },
      })

      return parseOrReport(InterestGroupEventSummarySchema.array(), rows.map(toInterestGroupEventSummary))
    },

    async findRegistrationById(handle, id) {
      const row = await handle.interestGroupEventRegistration.findUnique({
        where: { id, interestGroupEvent: { status: { not: "DELETED" } } },
        include: {
          user: { select: USER_SUMMARY_SELECT },
        },
      })

      return parseOrReport(InterestGroupEventRegistrationSchema.nullable(), row)
    },

    async findRegistrations(handle, interestGroupEventId) {
      const rows = await handle.interestGroupEventRegistration.findMany({
        where: { interestGroupEventId, interestGroupEvent: { status: { not: "DELETED" } } },
        include: {
          user: { select: USER_SUMMARY_SELECT },
        },
        orderBy: { createdAt: "asc" },
      })

      return parseOrReport(InterestGroupEventRegistrationSchema.array(), rows)
    },

    async createRegistration(handle, interestGroupEventId, userId) {
      const row = await handle.interestGroupEventRegistration.create({
        data: {
          interestGroupEventId,
          userId,
        },
      })

      const registration = await this.findRegistrationById(handle, row.id)
      invariant(registration !== null, "Created registration should not be null")
      return registration
    },

    async deleteRegistration(handle, interestGroupEventId: InterestGroupEventId, userId: UserId) {
      await handle.interestGroupEventRegistration.delete({
        where: {
          userId_interestGroupEventId: {
            userId,
            interestGroupEventId,
          },
        },
      })
    },
  }
}

const USER_SUMMARY_SELECT = {
  id: true,
  username: true,
  name: true,
  imageUrl: true,
} as const satisfies Prisma.UserSelect

function getInterestGroupEventInclude(includeUsers: boolean) {
  return {
    interestGroup: {
      include: {
        roles: true,
      },
    },
    registrations: includeUsers
      ? {
          include: {
            user: {
              select: USER_SUMMARY_SELECT,
            },
          },
        }
      : true,
  } as const
}

function toInterestGroupEventSummary(row: { registrations: readonly object[] }) {
  return {
    ...row,
    registrations: row.registrations.map((registration) => ({
      ...registration,
      user: "user" in registration ? registration.user : null,
    })),
  }
}

function getInterestGroupEventWhere(query: InterestGroupEventFilterQuery): Prisma.InterestGroupEventWhereInput {
  const status =
    query.byStatus && query.byStatus.length > 0
      ? { in: query.byStatus.filter((value) => value !== "DELETED") }
      : { not: "DELETED" as const }

  return {
    ...(query.byInterestGroupId &&
      query.byInterestGroupId.length > 0 && {
        interestGroupId: { in: query.byInterestGroupId },
      }),
    status,
    start: {
      gte: query.byStartDate?.min ?? undefined,
      lte: query.byStartDate?.max ?? undefined,
    },
    end: {
      gte: query.byEndDate?.min ?? undefined,
      lte: query.byEndDate?.max ?? undefined,
    },
    ...(query.bySearchTerm && {
      title: { contains: query.bySearchTerm, mode: "insensitive" },
    }),
  }
}
