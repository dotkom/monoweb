import type { DBClient } from "@dotkomonline/db"
import type { EventId, Group, GroupId } from "@dotkomonline/types"

export interface EventHostingGroupRepository {
  getAllEventHostingGroups(eventId: EventId): Promise<Group[]>
  getAllGroups(eventId: EventId): Promise<Group[]>
  addHostingGroupToEvent(eventId: EventId, groupId: GroupId): Promise<void>
  removeHostingGroupFromEvent(eventId: EventId, groupId: GroupId): Promise<void>
}

export class EventHostingGroupRepositoryImpl implements EventHostingGroupRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  public async getAllEventHostingGroups(eventId: EventId): Promise<Group[]> {
    const eventHostingGroups = await this.db.eventHostingGroup.findMany({
      where: { eventId },
      select: { group: true },
    })

    return eventHostingGroups.map((eventHostingGroup) => eventHostingGroup.group)
  }

  public async getAllGroups(eventId: EventId): Promise<Group[]> {
    return await this.getAllEventHostingGroups(eventId)
  }

  public async addHostingGroupToEvent(eventId: EventId, groupId: GroupId): Promise<void> {
    await this.db.eventHostingGroup.create({ data: { eventId, groupId } })
  }

  public async removeHostingGroupFromEvent(eventId: EventId, groupId: GroupId): Promise<void> {
    await this.db.eventHostingGroup.delete({ where: { groupId_eventId: { eventId, groupId } } })
  }
}
