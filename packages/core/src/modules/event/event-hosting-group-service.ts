import type { EventHostingGroup, EventId, Group, GroupId } from "@dotkomonline/types"
import type { EventHostingGroupRepository } from "./event-hosting-group-repository"

export interface EventHostingGroupService {
  getGroupsForEvent(eventId: EventId): Promise<Group[]>
  getHostingGroupsForEvent(eventId: EventId): Promise<Group[]>
  setEventHostingGroups(eventId: EventId, groups: GroupId[]): Promise<EventHostingGroup[]>
}

export class EventHostingGroupServiceImpl implements EventHostingGroupService {
  private readonly eventHostingGroupRepository: EventHostingGroupRepository

  constructor(eventHostingGroupRepository: EventHostingGroupRepository) {
    this.eventHostingGroupRepository = eventHostingGroupRepository
  }

  async getGroupsForEvent(eventId: EventId): Promise<Group[]> {
    const groups = await this.eventHostingGroupRepository.getAllGroups(eventId)
    return groups
  }

  async getHostingGroupsForEvent(eventId: EventId): Promise<Group[]> {
    const hostingGroups = await this.eventHostingGroupRepository.getAllEventHostingGroups(eventId)
    return hostingGroups
  }

  async setEventHostingGroups(eventId: EventId, groups: GroupId[]): Promise<EventHostingGroup[]> {
    // Fetch all groups associated with the event
    const eventHostingGroups = await this.getHostingGroupsForEvent(eventId)
    const currentHostingGroupIds = eventHostingGroups.map((hostingGroup) => hostingGroup.id)

    // Identify hosting groups to add and remove
    const hostingGroupsToRemove = currentHostingGroupIds.filter((groupId) => !groups.includes(groupId))
    const hostingGroupsToAdd = groups.filter((groupId) => !currentHostingGroupIds.includes(groupId))

    // Create promises for removal and addition operations
    const removePromises = hostingGroupsToRemove.map(async (groupId) =>
      this.eventHostingGroupRepository.removeHostingGroupFromEvent(eventId, groupId)
    )

    const addPromises = hostingGroupsToAdd.map(async (groupId) =>
      this.eventHostingGroupRepository.addHostingGroupToEvent(eventId, groupId)
    )

    // Execute all promises in parallel
    await Promise.all([...removePromises, ...addPromises])

    // After removal and addition, we can identify the remaining groups
    const remainingHostingGroups = currentHostingGroupIds
      .filter((groupId) => !hostingGroupsToRemove.includes(groupId)) // Remove the groups to remove
      .concat(hostingGroupsToAdd) // Add the groups to add

    return remainingHostingGroups.map((groupId) => ({
      eventId,
      groupId,
    }))
  }
}
