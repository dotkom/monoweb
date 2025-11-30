import type { DBHandle } from "@dotkomonline/db"
import type { AuditLog, AuditLogFilterQuery, AuditLogId, UserId } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"

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
        include: { user: true },
      })
      return auditLog
    },

    async findMany(handle, query, page) {
      const auditLogs = await handle.auditLog.findMany({
        ...pageQuery(page),
        include: {
          user: true,
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
          ],
        },
      })

      return auditLogs
    },

    async findManyByUserId(handle, userId, page) {
      const auditLogs = await handle.auditLog.findMany({
        where: { userId },
        include: {
          user: true,
        },
        ...pageQuery(page),
      })
      return auditLogs
    },
  }
}
