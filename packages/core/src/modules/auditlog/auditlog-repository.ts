import type { Database } from "@dotkomonline/db"
import {Auditlog, AuditlogId, AuditlogSchema, AuditlogWrite } from "@dotkomonline/types";

import { Kysely, Selectable } from 'kysely';
import { Collection, Pageable, paginatedQuery } from "../../utils/db-utils";

export interface AuditLogRepository {
  update(id: AuditlogId, input: Partial<AuditlogWrite>): Promise<Auditlog>
  getAll(pageable: Pageable): Promise<Collection<Auditlog>>
  getById(id: AuditlogId): Promise<Auditlog | undefined>
}

export const mapToAuditlog = (payload: Selectable<Database["auditlog"]>) => AuditlogSchema.parse(payload)

export class AuditlogRepository {
  constructor(private db: Kysely<Database>) {}

  async create(input: AuditlogWrite): Promise<Auditlog> {
    const auditlog = await this.db
      .insertInto("auditlog")
      .values({ ...input })
      .returningAll()
      .executeTakeFirstOrThrow()
    return mapToAuditlog(auditlog)
  }

  async getAll(pageable: Pageable) {
    return await paginatedQuery(this.db.selectFrom("auditlog").selectAll(), pageable, mapToAuditlog)
  }

  async getById(id: AuditlogId) {
    const auditlog = await this.db.selectFrom("auditlog").selectAll().where("id", "=", id).executeTakeFirst()
    return auditlog ? mapToAuditlog(auditlog) : undefined
  }
}