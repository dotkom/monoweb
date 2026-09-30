import type { DBHandle } from "@dotkomonline/db"
import type { Pageable } from "@dotkomonline/utils"
import { NotFoundError } from "../../error"
import type { UserId } from "../user/user"
import {
  AuditActivityTypeSchema,
  type AuditActivity,
  type AuditLog,
  type AuditLogFilterQuery,
  type AuditLogId,
} from "./audit-log"
import type { AuditLogRepository } from "./audit-log-repository"

export interface AuditLogService {
  findById(handle: DBHandle, auditLogId: AuditLogId): Promise<AuditLog | null>
  getById(handle: DBHandle, auditLogId: AuditLogId): Promise<AuditLog>
  findMany(handle: DBHandle, query: AuditLogFilterQuery, page: Pageable): Promise<AuditLog[]>
  findManyByUserId(handle: DBHandle, userId: UserId, page: Pageable): Promise<AuditLog[]>
  findManyAuditActivities(
    handle: DBHandle,
    query: AuditLogFilterQuery,
    offset: number,
    limit: number
  ): Promise<AuditActivity[]>
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

    async findManyAuditActivities(handle, query, offset, limit) {
      const activityIds = await auditLogRepository.findManyActivityIds(handle, query, offset, limit)
      const auditLogs = await auditLogRepository.findManyByIds(
        handle,
        activityIds
          .filter((activity) => activity.type === AuditActivityTypeSchema.enum.audit_log)
          .map((activity) => activity.id)
      )
      const auditTransactionsWithLogs = await auditLogRepository.findManyAuditTransactionsWithLogsByIds(
        handle,
        activityIds
          .filter((activity) => activity.type === AuditActivityTypeSchema.enum.audit_transaction)
          .map((activity) => activity.id)
      )

      const auditActivities: AuditActivity[] = []

      for (const activityId of activityIds) {
        if (activityId.type === AuditActivityTypeSchema.enum.audit_log) {
          const auditLog = auditLogs.find((log) => log.id === activityId.id)
          if (auditLog !== undefined) {
            auditActivities.push({
              id: activityId.id,
              createdAt: activityId.createdAt,
              name: null,
              procedure: null,
              userId: auditLog.userId,
              user: auditLog.user,
              logs: [auditLog],
            })
          }
        } else if (activityId.type === AuditActivityTypeSchema.enum.audit_transaction) {
          const auditTransactionWithLogs = auditTransactionsWithLogs.find(
            (transaction) => transaction.id === activityId.id
          )
          if (auditTransactionWithLogs !== undefined) {
            const user = auditTransactionWithLogs.logs.at(0)?.user

            auditActivities.push({
              id: activityId.id,
              createdAt: activityId.createdAt,
              name: auditTransactionWithLogs.name,
              procedure: auditTransactionWithLogs.procedure,
              userId: user?.id ?? null,
              user: user ?? null,
              logs: auditTransactionWithLogs.logs,
            })
          }
        }
      }

      return auditActivities
    },
  }
}
