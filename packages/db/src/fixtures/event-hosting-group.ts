import type { Prisma } from "@prisma/client"

export const getEventHostingGroupFixtures: (
  eventIds: string[],
  groupIds: string[]
) => Prisma.EventHostingGroupCreateManyInput[] = (eventIds, groupIds) => [
  {
    eventId: eventIds[0],
    groupId: groupIds[0],
  },
  {
    eventId: eventIds[0],
    groupId: groupIds[1],
  },
  {
    eventId: eventIds[1],
    groupId: groupIds[0],
  },
]
