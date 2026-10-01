import { sql, type DBHandle } from "@dotkomonline/db"
import { pageQuery, snakeCaseToCamelCase, type Pageable } from "@dotkomonline/utils"
import z from "zod"
import { parseOrReport } from "../../invariant"
import type { UserId } from "../user/user"
import { normalizeDbUser } from "../user/user"
import {
  AuditActivityIdSchema,
  AuditLogSchema,
  AuditTransactionWithLogsSchema,
  type AuditActivityId,
  type AuditLog,
  type AuditLogFilterQuery,
  type AuditLogId,
  type AuditTransactionWithLogs,
} from "./audit-log"

function normalizeAuditTransactionWithLogs<T extends { logs: Array<Parameters<typeof normalizeAuditLog>[0]> }>(
  auditTransactionWithLogs: T
) {
  const { logs, ...rest } = auditTransactionWithLogs

  return {
    ...rest,
    logs: logs.map((log) => normalizeAuditLog(log)),
  }
}

function normalizeAuditLog<T extends { user: Parameters<typeof normalizeDbUser>[0] | null; [key: string]: unknown }>(
  auditLog: T
) {
  const { user, ...rest } = auditLog

  return {
    ...rest,
    user: user ? normalizeDbUser(user) : null,
  }
}

const userInclude = {
  userFlagLinks: {
    include: {
      userFlag: true,
    },
  },
} as const

export interface AuditLogRepository {
  findById(handle: DBHandle, auditLogId: AuditLogId): Promise<AuditLog | null>
  findMany(handle: DBHandle, query: AuditLogFilterQuery, page: Pageable): Promise<AuditLog[]>
  findManyByUserId(handle: DBHandle, userId: UserId, page: Pageable): Promise<AuditLog[]>
  findManyByIds(handle: DBHandle, ids: string[]): Promise<AuditLog[]>
  findManyAuditTransactionsWithLogsByIds(handle: DBHandle, ids: string[]): Promise<AuditTransactionWithLogs[]>
  findManyActivityIds(
    handle: DBHandle,
    query: AuditLogFilterQuery,
    offset: number,
    limit: number
  ): Promise<AuditActivityId[]>
}

export function getAuditLogRepository(): AuditLogRepository {
  return {
    async findById(handle, auditLogId) {
      const auditLog = await handle.auditLog.findUnique({
        where: { id: auditLogId },
        include: { user: { include: userInclude } },
      })

      return parseOrReport(AuditLogSchema.nullable(), auditLog ? normalizeAuditLog(auditLog) : null)
    },

    async findMany(handle, query, page) {
      const auditLogs = await handle.auditLog.findMany({
        ...pageQuery(page),
        include: {
          user: { include: userInclude },
        },
        orderBy: {
          createdAt: "desc",
        },
        where: {
          AND: [
            query.bySearchTerm
              ? {
                  OR: [
                    {
                      user: {
                        name: {
                          contains: query.bySearchTerm,
                          mode: "insensitive",
                        },
                      },
                    },
                    {
                      user: {
                        email: {
                          contains: query.bySearchTerm,
                          mode: "insensitive",
                        },
                      },
                    },
                    {
                      tableName: {
                        contains: query.bySearchTerm,
                        mode: "insensitive",
                      },
                    },
                    {
                      operation: {
                        contains: query.bySearchTerm,
                        mode: "insensitive",
                      },
                    },
                    "system".startsWith(query.bySearchTerm.toLowerCase())
                      ? {
                          userId: null,
                        }
                      : undefined,
                  ].filter(Boolean) as object[],
                }
              : {},
            query.byUserId
              ? {
                  userId: {
                    in: query.byUserId,
                  },
                }
              : {},
            query.byTableName && query.byTableName.length > 0
              ? {
                  tableName: {
                    in: query.byTableName,
                  },
                }
              : {},
            query.byOperation && query.byOperation.length > 0
              ? {
                  operation: {
                    in: query.byOperation,
                  },
                }
              : {},
          ],
        },
      })

      return parseOrReport(AuditLogSchema.array(), auditLogs.map(normalizeAuditLog))
    },

    async findManyByUserId(handle, userId, page) {
      const auditLogs = await handle.auditLog.findMany({
        ...pageQuery(page),
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            include: userInclude,
          },
        },
      })

      return parseOrReport(AuditLogSchema.array(), auditLogs.map(normalizeAuditLog))
    },

    async findManyByIds(handle, ids) {
      const auditLogs = await handle.auditLog.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            include: userInclude,
          },
        },
      })

      return parseOrReport(AuditLogSchema.array(), auditLogs.map(normalizeAuditLog))
    },

    async findManyAuditTransactionsWithLogsByIds(handle, ids) {
      const auditTransactionsWithLogs = await handle.auditTransaction.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          logs: {
            include: {
              user: {
                include: userInclude,
              },
            },
          },
        },
      })

      return parseOrReport(
        AuditTransactionWithLogsSchema.array(),
        auditTransactionsWithLogs.map(normalizeAuditTransactionWithLogs)
      )
    },

    async findManyActivityIds(handle, query, offset, limit) {
      const auditLogAndTransactionIds = await handle.$queryRawTyped(
        sql.findAuditActivityIds(
          offset,
          limit,
          query.bySearchTerm ?? null,
          query.byTableName ?? [],
          query.byOperation ?? [],
          query.byUserId ?? []
        )
      )

      return parseOrReport(
        z.preprocess((data) => snakeCaseToCamelCase(data), AuditActivityIdSchema.array()),
        auditLogAndTransactionIds
      )
    },
  }
}
