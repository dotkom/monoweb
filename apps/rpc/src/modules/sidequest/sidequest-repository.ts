import type { DBHandle, Prisma } from "@dotkomonline/db"
import { pageQuery, type Pageable } from "@dotkomonline/utils"
import invariant from "tiny-invariant"
import { parseOrReport } from "../../invariant"
import type { UserId } from "../user/user"
import {
  SidequestRegistrationSchema,
  SidequestRequestSchema,
  SidequestStatusSchema,
  SidequestSummarySchema,
  SidequestSummaryWithRequestSchema,
  type SidequestFilterQuery,
  type SidequestId,
  type SidequestRegistration,
  type SidequestRegistrationId,
  type SidequestRequest,
  type SidequestRequestId,
  type SidequestRequestUpdate,
  type SidequestRequestWrite,
  type SidequestSummary,
  type SidequestSummaryWithRequest,
  type SidequestWrite,
} from "./sidequest"

export interface SidequestRepository {
  create(handle: DBHandle, data: SidequestWrite): Promise<SidequestSummary>
  update(handle: DBHandle, id: SidequestId, data: Partial<SidequestWrite>): Promise<SidequestSummary>
  findById(handle: DBHandle, id: SidequestId, includeUsers: boolean): Promise<SidequestSummary | null>
  findMany(
    handle: DBHandle,
    query: SidequestFilterQuery,
    page: Pageable,
    includeUsers: boolean
  ): Promise<SidequestSummary[]>
  findManyWithRequest(
    handle: DBHandle,
    query: SidequestFilterQuery,
    page: Pageable,
    includeUsers: boolean
  ): Promise<SidequestSummaryWithRequest[]>
  findByIdWithRequest(
    handle: DBHandle,
    id: SidequestId,
    includeUsers: boolean
  ): Promise<SidequestSummaryWithRequest | null>

  createRegistration(handle: DBHandle, sidequestId: SidequestId, userId: UserId): Promise<SidequestRegistration>
  deleteRegistration(handle: DBHandle, sidequestId: SidequestId, userId: UserId): Promise<void>
  findRegistrationById(handle: DBHandle, id: SidequestRegistrationId): Promise<SidequestRegistration | null>
  findRegistrations(handle: DBHandle, sidequestId: SidequestId): Promise<SidequestRegistration[]>

  createRequest(
    handle: DBHandle,
    sidequestId: SidequestId,
    requestedById: UserId,
    data: SidequestRequestWrite
  ): Promise<SidequestSummaryWithRequest>
  findRequestById(handle: DBHandle, id: SidequestRequestId): Promise<SidequestRequest | null>
  updateRequest(
    handle: DBHandle,
    id: SidequestRequestId,
    data: Partial<SidequestRequestUpdate>
  ): Promise<SidequestSummaryWithRequest>
}

export function getSidequestRepository(): SidequestRepository {
  return {
    async create(handle, data) {
      const row = await handle.sidequest.create({
        data,
        include: getSidequestInclude(false),
      })

      return parseOrReport(SidequestSummarySchema, toSidequestSummary(row))
    },

    async update(handle, id, data) {
      const row = await handle.sidequest.update({
        where: { id },
        data,
        include: getSidequestInclude(false),
      })

      return parseOrReport(SidequestSummarySchema, toSidequestSummary(row))
    },

    async findById(handle, id, includeUsers) {
      const row = await handle.sidequest.findUnique({
        where: { id, status: { not: SidequestStatusSchema.enum.DELETED } },
        include: getSidequestInclude(includeUsers),
      })

      if (row === null) {
        return null
      }

      return parseOrReport(SidequestSummarySchema.nullable(), toSidequestSummary(row))
    },

    async findByIdWithRequest(handle, id, includeUsers) {
      const row = await handle.sidequest.findUnique({
        where: { id, status: { not: SidequestStatusSchema.enum.DELETED } },
        include: {
          ...getSidequestInclude(includeUsers),
          request: true,
        },
      })

      if (row === null) {
        return null
      }

      return parseOrReport(SidequestSummaryWithRequestSchema.nullable(), {
        ...toSidequestSummary(row),
        request: row.request,
      })
    },

    async findMany(handle, query, page, includeUsers) {
      const rows = await handle.sidequest.findMany({
        where: getSidequestWhere(query),
        include: getSidequestInclude(includeUsers),
        ...pageQuery(page),
        orderBy: {
          start: query.orderBy ?? "desc",
        },
      })

      return parseOrReport(SidequestSummarySchema.array(), rows.map(toSidequestSummary))
    },

    async findManyWithRequest(handle, query, page, includeUsers) {
      const rows = await handle.sidequest.findMany({
        where: getSidequestWhere(query),
        include: {
          ...getSidequestInclude(includeUsers),
          request: true,
        },
        ...pageQuery(page),
        orderBy: {
          start: query.orderBy ?? "desc",
        },
      })

      return parseOrReport(
        SidequestSummaryWithRequestSchema.array(),
        rows.map((row) =>
          parseOrReport(SidequestSummaryWithRequestSchema, {
            ...toSidequestSummary(row),
            request: row.request,
          })
        )
      )
    },

    async findRegistrationById(handle, id) {
      const row = await handle.sidequestRegistration.findUnique({
        where: { id, sidequest: { status: { not: SidequestStatusSchema.enum.DELETED } } },
        include: {
          user: { select: USER_SUMMARY_SELECT },
        },
      })

      return parseOrReport(SidequestRegistrationSchema.nullable(), row)
    },

    async findRegistrations(handle, sidequestId) {
      const rows = await handle.sidequestRegistration.findMany({
        where: { sidequestId, sidequest: { status: { not: SidequestStatusSchema.enum.DELETED } } },
        include: {
          user: { select: USER_SUMMARY_SELECT },
        },
        orderBy: { createdAt: "asc" },
      })

      return parseOrReport(SidequestRegistrationSchema.array(), rows)
    },

    async createRegistration(handle, sidequestId, userId) {
      const row = await handle.sidequestRegistration.create({
        data: {
          sidequestId,
          userId,
        },
      })

      const registration = await this.findRegistrationById(handle, row.id)
      invariant(registration !== null, "Created registration should not be null")
      return registration
    },

    async deleteRegistration(handle, sidequestId: SidequestId, userId: UserId) {
      await handle.sidequestRegistration.delete({
        where: {
          userId_sidequestId: {
            userId,
            sidequestId,
          },
        },
      })
    },

    async createRequest(handle, sidequestId, requestedById, data) {
      await handle.sidequestRequest.create({
        data: {
          ...data,
          sidequestId,
          requestedById,
        },
      })

      const sidequest = await this.findByIdWithRequest(handle, sidequestId, false)
      invariant(sidequest !== null, "Connected sidequest should not be null")

      return sidequest
    },

    async findRequestById(handle, id) {
      const row = await handle.sidequestRequest.findUnique({
        where: { id, sidequest: { status: { not: SidequestStatusSchema.enum.DELETED } } },
      })

      if (row === null) {
        return null
      }

      return parseOrReport(SidequestRequestSchema.nullable(), row)
    },

    async updateRequest(handle, id, data) {
      const row = await handle.sidequestRequest.update({
        where: { id },
        data,
      })

      const sidequest = await this.findByIdWithRequest(handle, row.sidequestId, false)
      invariant(sidequest !== null, "Connected sidequest should not be null")

      return sidequest
    },
  }
}

const USER_SUMMARY_SELECT = {
  id: true,
  username: true,
  name: true,
  imageUrl: true,
} as const satisfies Prisma.UserSelect

function getSidequestInclude(includeUsers: boolean) {
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
      : {
          omit: {
            userId: true,
          },
        },
  } as const satisfies Prisma.SidequestInclude
}

function toSidequestSummary(row: { registrations: readonly object[] }) {
  return {
    ...row,
    registrations: row.registrations.map((registration) => ({
      ...registration,
      userId: "userId" in registration ? registration.userId : null,
      user: "user" in registration ? registration.user : null,
    })),
  }
}

function getSidequestWhere(query: SidequestFilterQuery): Prisma.SidequestWhereInput {
  const status =
    query.byStatus && query.byStatus.length > 0
      ? { in: query.byStatus.filter((value) => value !== SidequestStatusSchema.enum.DELETED) }
      : { not: SidequestStatusSchema.enum.DELETED }

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
