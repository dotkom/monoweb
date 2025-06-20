import type { Group, GroupId, GroupMember, GroupMemberWrite, GroupType, GroupWrite, UserId } from "@dotkomonline/types"
import { GroupNotFoundError } from "./group-error"
import type { GroupRepository } from "./group-repository"

export interface GroupService {
  /**
   * Get a group by its id
   *
   * @throws {GroupNotFoundError} if the group does not exist
   */
  getGroup(groupId: GroupId): Promise<Group>
  /**
   * Get a group by its id and type
   *
   * @throws {GroupNotFoundError} if the group does not exist
   */
  getGroupByType(groupId: GroupId, groupType: GroupType): Promise<Group>
  getGroups(): Promise<Group[]>
  getGroupsByType(groupType: GroupType): Promise<Group[]>
  createGroup(payload: GroupWrite): Promise<Group>
  updateGroup(groupId: GroupId, values: Partial<GroupWrite>): Promise<Group>
  deleteGroup(groupId: GroupId): Promise<void>
  getAllGroupIds(): Promise<GroupId[]>
  getAllGroupIdsByType(groupType: GroupType): Promise<GroupId[]>
  getMembers(groupId: GroupId): Promise<GroupMember[]>
  getGroupsByMember(userId: UserId): Promise<Group[]>
  addMember(data: GroupMemberWrite): Promise<GroupMember>
  removeMember(userId: UserId, groupId: GroupId): Promise<void>
}

export class GroupServiceImpl implements GroupService {
  private readonly groupRepository: GroupRepository

  constructor(groupRepository: GroupRepository) {
    this.groupRepository = groupRepository
  }

  async getGroup(groupId: GroupId) {
    const group = await this.groupRepository.getById(groupId)
    if (!group) {
      throw new GroupNotFoundError(groupId)
    }
    return group
  }

  async getGroupByType(groupId: GroupId, groupType: GroupType) {
    const group = await this.groupRepository.getById(groupId)
    if (!group || group.type !== groupType) {
      throw new GroupNotFoundError(groupId)
    }
    return group
  }

  async createGroup(payload: GroupWrite) {
    return await this.groupRepository.create(payload)
  }

  async updateGroup(groupId: GroupId, values: Partial<GroupWrite>) {
    return await this.groupRepository.update(groupId, values)
  }

  async deleteGroup(groupId: GroupId) {
    await this.groupRepository.delete(groupId)
  }

  async getGroups() {
    return await this.groupRepository.getAll()
  }

  async getGroupsByType(groupType: GroupType) {
    return await this.groupRepository.getAllByType(groupType)
  }

  async getAllGroupIds() {
    return await this.groupRepository.getAllIds()
  }

  async getAllGroupIdsByType(groupType: GroupType) {
    return await this.groupRepository.getAllIdsByType(groupType)
  }

  async getMembers(groupId: GroupId) {
    return await this.groupRepository.getMembers(groupId)
  }

  async getGroupsByMember(userId: UserId) {
    return await this.groupRepository.getAllByMember(userId)
  }

  async addMember(data: GroupMemberWrite) {
    return await this.groupRepository.addMember(data)
  }

  async removeMember(userId: UserId, groupId: GroupId) {
    await this.groupRepository.removeMember(userId, groupId)
  }
}
