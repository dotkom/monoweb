import type {
  Auditlog,
  AuditlogId,
  AuditlogWrite,
  UserId,
} from "@dotkomonline/types"
import type { AuditlogRepository } from "./auditlog-repository"
import { UserService } from "../user/user-service"

export interface AuditlogService {
  getById(id: AuditlogId): Promise<Auditlog | null>
  getAll(): Promise<Auditlog[]>
  create(values: AuditWrite): Promise<Auditlog>
}

export interface AuditWrite {
  action: "CREATE" | "UPDATE" | "DELETE"
  userId: string
  recordId: string
  modelName: string
  changes: string | null
}

export class AuditlogServiceImpl implements AuditlogService {
  constructor(
    private readonly userService: UserService,
    private readonly AuditlogRepository: AuditlogRepository,
  ) {}

  async getById(id: AuditlogId): Promise<Auditlog | null> {
    return this.AuditlogRepository.getById(id)
  }

  async getAll(): Promise<Auditlog[]> {
    return this.AuditlogRepository.getAll()
  }

  async create(values: AuditWrite): Promise<Auditlog> {
    const user = await this.userService.getById(values.userId)

    if(user == null) throw new Error("User not found")

      return this.AuditlogRepository.create({
      ...values,
      firstName: user.firstName,
      lastName: user.lastName,
    })
  }
}
