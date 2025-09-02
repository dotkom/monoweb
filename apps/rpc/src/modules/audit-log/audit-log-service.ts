import { type DBHandle } from "@dotkomonline/db"
import { AuditLog } from "@dotkomonline/types";
import { AuditLogRepository } from "./audit-log-repository";
import type { Pageable } from "../../query"

export interface AuditLogService {
  getAuditLogs(handle: DBHandle, page: Pageable): Promise<AuditLog[]>;
  getAuditLogById(handle: DBHandle, id: string): Promise<AuditLog>;
  getAuditLogsByUserId(handle: DBHandle, userId: string, page: Pageable): Promise<AuditLog[]>;
}

export function getAuditLogService(auditLogRepository: AuditLogRepository): AuditLogService {
  return {
    async getAuditLogs(handle: DBHandle, page: Pageable): Promise<AuditLog[]> {
      const auditLogs = await auditLogRepository.getAll(handle, page);
      return auditLogs; 
    },

    async getAuditLogById(handle: DBHandle, id: string): Promise<AuditLog> {
      const auditLog = await auditLogRepository.getById(handle, id);
      if (!auditLog) {
        throw new Error(`Audit log with ID ${id} not found`);
      }
      return auditLog;
    },

    async getAuditLogsByUserId(handle: DBHandle, userId: string, page: Pageable): Promise<AuditLog[]> {
      const auditLog = await auditLogRepository.getByUserId(handle, userId, page);
      return auditLog;
    }
  }
}
