import type { DBHandle } from "@dotkomonline/db"
import type { AuditLog, AuditLogFilterQuery, AuditLogId, UserId } from "@dotkomonline/types"
import { NotFoundError } from "../../error"
import type { Pageable } from "../../query"
import type { AuditLogRepository } from "./audit-log-repository"

export interface AuditLogService {
  findById(handle: DBHandle, auditLogId: AuditLogId): Promise<AuditLog | null>
  getById(handle: DBHandle, auditLogId: AuditLogId): Promise<AuditLog>
  findMany(handle: DBHandle, query: AuditLogFilterQuery, page: Pageable): Promise<AuditLog[]>
  findManyByUserId(handle: DBHandle, userId: UserId, page: Pageable): Promise<AuditLog[]>
}

export function getAuditLogService(auditLogRepository: AuditLogRepository): AuditLogService {
  return {
    async findById(handle, auditLogId) {
      const auditLog = await auditLogRepository.findById(handle, auditLogId)
      return auditLog
    },

    async getById(handle, auditLogId) {
      const auditLog = await this.findById(handle, auditLogId)
      if (!auditLog) {
        throw new NotFoundError(`AuditLog(ID=${auditLogId}) not found`)
      }
      return auditLog
    },

    async findMany(handle, query, page) {
      const auditLogs = await auditLogRepository.findMany(handle, query, page)
      return auditLogs
    },

    async findManyByUserId(handle, userId, page) {
      const auditLog = await auditLogRepository.findManyByUserId(handle, userId, page)
      return auditLog
    },
  }
}
