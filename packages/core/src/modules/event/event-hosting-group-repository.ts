import type { DBHandle } from "@dotkomonline/db"
import type { EventId, Group, GroupId } from "@dotkomonline/types"

export interface EventHostingGroupRepository {
  getAllEventHostingGroups(handle: DBHandle, eventId: EventId): Promise<Group[]>
  getAllGroups(handle: DBHandle, eventId: EventId): Promise<Group[]>
  addHostingGroupToEvent(handle: DBHandle, eventId: EventId, groupId: GroupId): Promise<void>
  removeHostingGroupFromEvent(handle: DBHandle, eventId: EventId, groupId: GroupId): Promise<void>
}

export function getEventHostingGroupRepository(): EventHostingGroupRepository {
  return {
    async getAllEventHostingGroups(handle, eventId) {
      return await handle.eventHostingGroup
        .findMany({
          where: { eventId },
          select: { group: true },
        })
        .then((eventHostingGroups) => eventHostingGroups.map((eventHostingGroup) => eventHostingGroup.group))
    },
    async getAllGroups(handle, eventId) {
      return await this.getAllEventHostingGroups(handle, eventId)
    },
    async addHostingGroupToEvent(handle, eventId, groupId) {
      await handle.eventHostingGroup.create({ data: { eventId, groupId } })
    },
    async removeHostingGroupFromEvent(handle, eventId, groupId) {
      await handle.eventHostingGroup.delete({ where: { groupId_eventId: { eventId, groupId } } })
    },
  }
}
