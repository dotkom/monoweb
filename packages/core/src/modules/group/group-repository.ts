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

  public async getById(groupId: GroupId) {
    return await this.db.group.findUnique({ where: { id: groupId } })
  }

  public async getAll() {
    return await this.db.group.findMany()
  }

  public async getAllByType(groupType: GroupType) {
    return await this.db.group.findMany({ where: { type: groupType } })
  }

  public async create(data: GroupWrite) {
    return await this.db.group.create({ data })
  }

  public async update(groupId: GroupId, data: Partial<GroupWrite>) {
    return await this.db.group.update({ where: { id: groupId }, data })
  }

  public async delete(groupId: GroupId) {
    await this.db.group.delete({ where: { id: groupId } })
  }

  public async getAllIds() {
    return (await this.db.group.findMany({ select: { id: true } })).map((group) => group.id)
  }

  public async getAllIdsByType(groupType: GroupType) {
    return (await this.db.group.findMany({ where: { type: groupType }, select: { id: true } })).map((group) => group.id)
  }

  public async getMembers(groupId: GroupId) {
    return await this.db.groupMember.findMany({ where: { groupId: groupId } })
  }

  public async getAllByMember(userId: UserId) {
    return await this.db.group.findMany({ where: { members: { some: { userId } } } })
  }

  public async addMember(data: GroupMemberWrite) {
    return await this.db.groupMember.create({ data: data })
  }

  public async removeMember(userId: UserId, groupId: GroupId) {
    await this.db.groupMember.delete({ where: { userId: userId, groupId: groupId } })
  }
}
