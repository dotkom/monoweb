import type { Group, GroupId, GroupType, GroupWrite } from "@dotkomonline/types"
import { GroupNotFoundError } from "./group-error"
import type { GroupRepository } from "./group-repository"

export interface GroupService {
  getGroup(id: GroupId): Promise<Group>
  getGroupByType(id: GroupId, type: GroupType): Promise<Group>
  getGroups(): Promise<Group[]>
  getGroupsByType(type: GroupType): Promise<Group[]>
  createGroup(payload: GroupWrite): Promise<Group>
  updateGroup(id: GroupId, values: Partial<GroupWrite>): Promise<Group>
  deleteGroup(id: GroupId): Promise<void>
  getAllGroupIds(): Promise<GroupId[]>
  getAllGroupIdsByType(type: GroupType): Promise<GroupId[]>
}

export class GroupServiceImpl implements GroupService {
  private readonly groupRepository: GroupRepository

  constructor(groupRepository: GroupRepository) {
    this.groupRepository = groupRepository
  }

  /**
   * Get a group by its id
   *
   * @throws {GroupNotFoundError} if the group does not exist
   */
  async getGroup(id: GroupId) {
    const group = await this.groupRepository.getById(id)
    if (!group) {
      throw new GroupNotFoundError(id)
    }
    return group
  }

  /**
   * Get a group by its id and type
   *
   * @throws {GroupNotFoundError} if the group does not exist
   */
  async getGroupByType(id: GroupId, type: GroupType) {
    const group = await this.groupRepository.getById(id)
    if (!group || group.type !== type) {
      throw new GroupNotFoundError(id)
    }
    return group
  }

  async createGroup(payload: GroupWrite) {
    return await this.groupRepository.create(payload)
  }

  async updateGroup(id: GroupId, values: Partial<GroupWrite>): Promise<Group> {
    return await this.groupRepository.update(id, values)
  }

  async deleteGroup(id: GroupId): Promise<void> {
    await this.groupRepository.delete(id)
  }

  async getGroups() {
    return await this.groupRepository.getAll()
  }

  async getGroupsByType(type: GroupType) {
    return await this.groupRepository.getAllByType(type)
  }

  async getAllGroupIds() {
    return await this.groupRepository.getAllIds()
  }

  async getAllGroupIdsByType(type: GroupType) {
    return await this.groupRepository.getAllIdsByType(type)
  }
}
