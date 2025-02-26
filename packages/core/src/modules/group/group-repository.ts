import type { DBClient } from "@dotkomonline/db"
import type { Group, GroupId, GroupWrite } from "@dotkomonline/types"
import type { GroupType } from "@prisma/client"

export interface GroupRepository {
  create(values: GroupWrite): Promise<Group>
  update(id: GroupId, data: Partial<GroupWrite>): Promise<Group>
  delete(id: GroupId): Promise<void>
  getById(id: GroupId): Promise<Group | null>
  getAll(): Promise<Group[]>
  getAllByType(type: GroupType): Promise<Group[]>
  getAllIds(): Promise<GroupId[]>
  getAllIdsByType(type: GroupType): Promise<GroupId[]>
}

export class GroupRepositoryImpl implements GroupRepository {
  constructor(private readonly db: DBClient) {}

  async getById(id: GroupId) {
    return await this.db.group.findUnique({ where: { id } })
  }

  async getAll() {
    return await this.db.group.findMany({})
  }

  async getAllByType(type: GroupType) {
    return await this.db.group.findMany({ where: { type: type } })
  }

  async create(data: GroupWrite) {
    return await this.db.group.create({ data })
  }

  async update(id: GroupId, data: Partial<GroupWrite>): Promise<Group> {
    return await this.db.group.update({ where: { id }, data })
  }

  async delete(id: GroupId): Promise<void> {
    await this.db.group.delete({ where: { id } })
  }

  async getAllIds() {
    return (await this.db.group.findMany({ select: { id: true } })).map((group) => group.id)
  }

  async getAllIdsByType(type: GroupType) {
    return (await this.db.group.findMany({ where: { type: type }, select: { id: true } })).map((group) => group.id)
  }
}
