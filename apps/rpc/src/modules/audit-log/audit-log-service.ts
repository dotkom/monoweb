import type { DBHandle } from "@dotkomonline/db"
import type { AuditLog, AuditLogFilterQuery } from "@dotkomonline/types"
import type { Pageable } from "../../query"
import type { AuditLogRepository } from "./audit-log-repository"

export interface AuditLogService {
  getAuditLogs(handle: DBHandle, page: Pageable): Promise<AuditLog[]>
  findMany(handle: DBHandle, query: AuditLogFilterQuery, page: Pageable): Promise<AuditLog[]>
  getAuditLogById(handle: DBHandle,  id: string): Promise<AuditLog>
  getAuditLogsByUserId(handle: DBHandle, userId: string, page: Pageable): Promise<AuditLog[]>
}

export function getAuditLogService(auditLogRepository: AuditLogRepository): AuditLogService {
  return {
    async getAuditLogs(handle: DBHandle, page: Pageable): Promise<AuditLog[]> {
      const auditLogs = await auditLogRepository.getAll(handle, page)
      return auditLogs
    },
    async findMany(handle: DBHandle, query: AuditLogFilterQuery, page: Pageable): Promise<AuditLog[]> {
      const auditLogs = await auditLogRepository.findMany(handle, query, page)
      return auditLogs
    },

    async getAuditLogById(handle: DBHandle, id: string): Promise<AuditLog> {
      const auditLog = await auditLogRepository.getById(handle, id)
      if (!auditLog) {
        throw new Error(`Audit log with ID ${id} not found`)
      }
      return auditLog
    },

    async getAuditLogsByUserId(handle: DBHandle, userId: string, page: Pageable): Promise<AuditLog[]> {
      const auditLog = await auditLogRepository.getByUserId(handle, userId, page)
      return auditLog
    },
  }
}
