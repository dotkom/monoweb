import type { DBClient } from "@dotkomonline/db"
import type { Group, GroupId, GroupMember, GroupMemberWrite, GroupWrite, UserId } from "@dotkomonline/types"
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
  getMembers(id: GroupId): Promise<GroupMember[]>
  getAllByMember(userId: UserId): Promise<Group[]>
  addMember(data: GroupMemberWrite): Promise<GroupMember>
  removeMember(userId: UserId, groupId: GroupId): Promise<void>
}

export class GroupRepositoryImpl implements GroupRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

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

  async getMembers(id: GroupId): Promise<GroupMember[]> {
    return await this.db.groupMember.findMany({ where: { groupId: id } })
  }

  async getAllByMember(userId: UserId): Promise<Group[]> {
    return await this.db.group.findMany({ where: { members: { some: { userId } } } })
  }

  async addMember(data: GroupMemberWrite): Promise<GroupMember> {
    return await this.db.groupMember.create({ data: data })
  }

  async removeMember(userId: UserId, groupId: GroupId): Promise<void> {
    await this.db.groupMember.delete({ where: { userId: userId, groupId: groupId } })
  }
}
