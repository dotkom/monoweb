import type { Prisma } from "@prisma/client"

export const getEventCommitteeFixtures: (
  eventIds: string[],
  committeeIds: string[]
) => Prisma.EventCommitteeCreateManyInput[] = (eventIds, committeeIds) => [
  {
    eventId: eventIds[0],
    committeeId: committeeIds[0],
  },
  {
    eventId: eventIds[0],
    committeeId: committeeIds[1],
  },
  {
    eventId: eventIds[1],
    committeeId: committeeIds[0],
  },
]
