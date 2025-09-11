import type { DBHandle } from "@dotkomonline/db"
import type { AuditLog, AuditLogFilterQuery } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "src/query"

export interface AuditLogRepository {
  getById(handle: DBHandle, id: string): Promise<AuditLog | null>
  getAll(handle: DBHandle, page: Pageable): Promise<AuditLog[]>
  findMany(handle: DBHandle, query: AuditLogFilterQuery, page: Pageable): Promise<AuditLog[]>
  getByUserId(handle: DBHandle, userId: string, page: Pageable): Promise<AuditLog[]>
}
export function getAuditLogRepository(): AuditLogRepository {
  return {
    async getById(handle, id) {
      const auditLog = await handle.auditLog.findUnique({
        where: { id },
        include: { user: true },
      })
      if (!auditLog) {
        throw new Error(`AuditLog with id ${id} not found`)
      }
      return auditLog
    },
    async getByUserId(handle, userId, page) {
      const auditLogs = await handle.auditLog.findMany({
        where: { userId },
        include: {
          user: true,
        },
        ...pageQuery(page),
      })
      return auditLogs
    },
    async getAll(handle, page) {
      const auditLogs = await handle.auditLog.findMany({
        ...pageQuery(page),
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
      return auditLogs
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
            ? 
            {
              OR: [
                {
                  user:
                    {
                      name: {
                        contains: query.bySearchTerm,
                        mode: "insensitive"
                      }
                    }
              },
                {
                  user:
                    {
                      email: {
                        contains: query.bySearchTerm,
                        mode: "insensitive"
                      }
                    }
              },
              {
                tableName:
                {
                  contains: query.bySearchTerm,
                  mode: "insensitive"
                }
              },
              {
                operation: 
                   {
                    contains: query.bySearchTerm,
                    mode: "insensitive"
                  }
              },
              "system".startsWith(query.bySearchTerm.toLowerCase()) ? {
                userId: null
              } : undefined,
              ].filter(Boolean) as object[],
          } : {
            
          },
          
          ]
        }
      })

      return auditLogs
    },
  }
}
