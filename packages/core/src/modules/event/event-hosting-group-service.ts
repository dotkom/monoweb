import type { DBHandle } from "@dotkomonline/db"
import type { EventHostingGroup, EventId, Group, GroupId } from "@dotkomonline/types"
import type { EventHostingGroupRepository } from "./event-hosting-group-repository"

export interface EventHostingGroupService {
  getGroupsForEvent(handle: DBHandle, eventId: EventId): Promise<Group[]>
  getHostingGroupsForEvent(handle: DBHandle, eventId: EventId): Promise<Group[]>
  setEventHostingGroups(handle: DBHandle, eventId: EventId, groups: GroupId[]): Promise<EventHostingGroup[]>
}

export function getEventHostingGroupService(
  eventHostingGroupRepository: EventHostingGroupRepository
): EventHostingGroupService {
  return {
    async getGroupsForEvent(handle, eventId) {
      return await eventHostingGroupRepository.getAllGroups(handle, eventId)
    },

    async getHostingGroupsForEvent(handle, eventId) {
      return await eventHostingGroupRepository.getAllEventHostingGroups(handle, eventId)
    },

    async setEventHostingGroups(handle, eventId, groups) {
      // Fetch all groups associated with the event
      const eventHostingGroups = await this.getHostingGroupsForEvent(handle, eventId)
      const currentHostingGroupIds = eventHostingGroups.map((hostingGroup) => hostingGroup.id)

      // Identify hosting groups to add and remove
      const hostingGroupsToRemove = currentHostingGroupIds.filter((groupId) => !groups.includes(groupId))
      const hostingGroupsToAdd = groups.filter((groupId) => !currentHostingGroupIds.includes(groupId))

      // Create promises for removal and addition operations
      const removePromises = hostingGroupsToRemove.map(async (groupId) =>
        eventHostingGroupRepository.removeHostingGroupFromEvent(handle, eventId, groupId)
      )

      const addPromises = hostingGroupsToAdd.map(async (groupId) =>
        eventHostingGroupRepository.addHostingGroupToEvent(handle, eventId, groupId)
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
    },
  }
}
