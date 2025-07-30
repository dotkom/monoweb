import type { Prisma } from "@prisma/client"

export const getEventHostingGroupFixtures: (eventIds: string[]) => Prisma.EventHostingGroupCreateManyInput[] = (
  eventIds
) => [
  {
    // Kurs i å lage fixtures
    eventId: eventIds[0],
    groupId: "fagkom",
  },
  {
    // Kurs i å lage fixtures
    eventId: eventIds[0],
    groupId: "dotkom",
  },
  {
    // Åre 2025
    eventId: eventIds[1],
    groupId: "arrkom",
  },
  {
    // Sommerfest 2025
    eventId: eventIds[2],
    groupId: "backlog",
  },
  {
    // Sommerfest 2025
    eventId: eventIds[2],
    groupId: "hs",
  },
  {
    // Vinkurs 🍷
    eventId: eventIds[3],
    groupId: "fagkom",
  },
  {
    // Infomøte om ekskursjonen
    eventId: eventIds[4],
    groupId: "ekskom",
  },
]
