
import { DBHandle } from "@dotkomonline/db"
import { Prisma } from "@prisma/client"
import { type AuditLog } from "@dotkomonline/types"
import { Pageable, pageQuery } from 'src/query'

export interface AuditLogRepository {
  getById(handle: DBHandle, id: string): Promise<AuditLog | null>
  getAll(handle: DBHandle, page: Pageable): Promise<AuditLog[]>
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
    return auditLog;
    },
    async getByUserId(handle, userId, page) {
      const auditLogs = await handle.auditLog.findMany(
        { 
        where: { userId }, 
        include : { 
          user: true
        } 
        , ...pageQuery(page) 
      })
      return auditLogs
    },

    async getAll(handle, page) {
      const auditLogs = await handle.auditLog.findMany({
        include: { 
          user: true,
        },
        ...pageQuery(page),      
        orderBy: {
          createdAt: "desc",
        }, })
          
      return auditLogs
    },
  }
}
