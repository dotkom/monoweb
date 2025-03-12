import type { DBClient } from "@dotkomonline/db"
import type {
  Auditlog,
  AuditlogId,
  AuditlogWrite,
} from "@dotkomonline/types"
import { AuditWrite } from "./auditlog-service"

export interface AuditlogRepository {
  getById(id: AuditlogId): Promise<Auditlog | null>
  getAll(): Promise<Auditlog[]>
  create(value: AuditWrite): Promise<Auditlog>
  // update(id: AuditlogId, values: Partial<AuditlogWrite>): Promise<Auditlog>
  // delete(id: AuditlogId): Promise<void>
}

export class AuditlogRepositoryImpl implements AuditlogRepository {
  constructor(private readonly db: DBClient) {}

  async getById(id: AuditlogId): Promise<Auditlog | null> {
    return await this.db.auditlog.findUnique({ where: { id } })
  }

  async getAll(): Promise<Auditlog[]> {
    return await this.db.auditlog.findMany({})
  }
  async create(data: AuditWrite): Promise<Auditlog> {
    return await this.db.auditlog.create({
      data: {
        action: data.action,
        userId: data.userId,
        recordId: data.recordId,
        modelName: data.modelName,
      },
    })
  }

  // async update(id: AuditlogId, data: Partial<AuditlogWrite>): Promise<Auditlog> {
  //   return await this.db.auditlog.update({ where: { id }, data })
  // }

  async delete(id: AuditlogId): Promise<void> {
    await this.db.auditlog.delete({ where: { id } })
  }
}
