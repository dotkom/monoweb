import type { DBHandle } from "@dotkomonline/db"
import { AuditLogSchema, type AuditLog, type AuditLogFilterQuery, type AuditLogId } from "./audit-log"
import { normalizeDbUser } from "../user/user"
import type { UserId } from "../user/user"
import { type Pageable, pageQuery } from "@dotkomonline/utils"
import { parseOrReport } from "../../invariant"

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
        where: { userId },
        include: {
          user: { include: userInclude },
        },
        ...pageQuery(page),
      })

      return parseOrReport(AuditLogSchema.array(), auditLogs.map(normalizeAuditLog))
    },
  }
}
