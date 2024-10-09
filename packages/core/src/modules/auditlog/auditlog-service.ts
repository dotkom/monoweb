import type { Auditlog, AuditlogId, AuditlogWrite, Committee, CommitteeId, CommitteeWrite } from "@dotkomonline/types"
import type { Collection, Pageable } from "../../utils/db-utils"
import { AuditlogNotFoundError } from "./auditlog-error"
import type { AuditlogRepository } from "./auditlog-repository"

export interface AuditlogService {
  getAuditlog(id: AuditlogId): Promise<Auditlog>
  getAuditlogs(pageable: Pageable): Promise<Collection<Auditlog>>
  createAuditlog(payload: AuditlogWrite): Promise<Auditlog>
}

export class AuditlogServiceImpl implements AuditlogService {
  constructor(private readonly auditlogRepository: AuditlogRepository) {}

  /**
   * Get a auditlog by its id
   *
   * @throws {AuditlogNotFoundError} if the auditlog does not exist
   */
  async getAuditlog(id: AuditlogId) {
    const auditlog = await this.auditlogRepository.getById(id)
    if (!auditlog) {
      throw new AuditlogNotFoundError(id)
    }
    return auditlog
  }

  async createAuditlog(payload: AuditlogWrite) {
    return await this.auditlogRepository.create(payload)
  }

  async getAuditlogs(pageable: Pageable) {
    return this.auditlogRepository.getAll(pageable)
  }

}
