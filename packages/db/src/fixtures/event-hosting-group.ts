import type { Prisma } from "../"

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
  {
    // 1.klasse eksamensfest
    eventId: eventIds[7],
    groupId: "arrkom",
  },
  {
    // Utmatrikulering 5. klasse
    eventId: eventIds[8],
    groupId: "hs",
  },
  {
    // FotballtrøyeFredag!
    eventId: eventIds[9],
    groupId: "trikom",
  },
  {
    // Eksamenskurs i Diskret matematikk
    eventId: eventIds[10],
    groupId: "fagkom",
  },
  {
    // Volleyballturnering med NTNUI
    eventId: eventIds[11],
    groupId: "oil",
  },
  {
    // Eksamenslesing for 1.klasse
    eventId: eventIds[12],
    groupId: "trikom",
  },
  {
    // 17. mai-frokost
    eventId: eventIds[13],
    groupId: "arrkom",
  },
]
