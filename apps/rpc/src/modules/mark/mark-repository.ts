import type { DBHandle } from "@dotkomonline/db"
import {
  type Group,
  type GroupId,
  type Mark,
  type MarkFilterQuery,
  type MarkId,
  MarkSchema,
  type MarkWrite,
} from "@dotkomonline/types"
import { parseOrReport } from "../../invariant"
import { type Pageable, pageQuery } from "../../query"

export interface MarkRepository {
  create(handle: DBHandle, markData: MarkWrite, groupIdsData: GroupId[]): Promise<Mark>
  update(handle: DBHandle, markId: MarkId, markData: MarkWrite, groupIdsData: GroupId[]): Promise<Mark>
  delete(handle: DBHandle, markId: MarkId): Promise<Mark>
  findById(handle: DBHandle, markId: MarkId): Promise<Mark | null>
  findMany(handle: DBHandle, query: MarkFilterQuery, page: Pageable): Promise<Mark[]>
}

export function getMarkRepository(): MarkRepository {
  return {
    async create(handle, data, groupIds) {
      const mark = await handle.mark.create({
        data: {
          ...data,
          groups: {
            create: groupIds.map((groupId) => ({
              groupId,
            })),
          },
        },
        include: QUERY_WITH_GROUPS,
      })

      return mapMark(mark, mark.groups)
    },

    async update(handle, markId, data, groupIds) {
      const mark = await handle.mark.update({
        where: { id: markId },
        data: {
          ...data,
          groups: {
            deleteMany: {
              markId,
              groupId: {
                notIn: groupIds,
              },
            },
            connectOrCreate: groupIds.map((groupId) => ({
              where: {
                markId_groupId: { markId, groupId },
              },
              create: {
                groupId,
              },
            })),
          },
        },
        include: QUERY_WITH_GROUPS,
      })

      return mapMark(mark, mark.groups)
    },

    async delete(handle, markId) {
      const mark = await handle.mark.delete({ where: { id: markId } })

      return parseOrReport(MarkSchema, mark)
    },

    async findById(handle, markId) {
      const mark = await handle.mark.findUnique({
        where: { id: markId },
        include: QUERY_WITH_GROUPS,
      })

      return mark ? mapMark(mark, mark.groups) : null
    },

    async findMany(handle, query, page) {
      const marks = await handle.mark.findMany({
        ...pageQuery(page),
        orderBy: { createdAt: "desc" },
        where: {
          AND: [
            {
              id:
                query.byId && query.byId.length > 0
                  ? {
                      in: query.byId,
                    }
                  : undefined,
            },
            {
              users:
                query.byGivenToUserId && query.byGivenToUserId.length > 0
                  ? {
                      some: {
                        userId: { in: query.byGivenToUserId },
                      },
                    }
                  : undefined,
            },
          ],
        },
        include: QUERY_WITH_GROUPS,
      })

      return marks.map((mark) => mapMark(mark, mark.groups))
    },
  }
}

export function mapMark(mark: Omit<Mark, "groups">, groups: { group: Group }[]): Mark {
  return parseOrReport(MarkSchema, {
    ...mark,
    groups: groups.map((group) => group.group),
  })
}

const QUERY_WITH_GROUPS = {
  groups: {
    include: {
      group: {
        include: {
          roles: true,
        },
      },
    },
  },
} as const
