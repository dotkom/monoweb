import type { Prisma } from "../"
export const fixtureOfflineId = {
  offline1: "o1000001-0000-4000-8000-000000000001",
  offline2: "o1000002-0000-4000-8000-000000000002",
} as const

export const getOfflineFixtures = (): Prisma.OfflineCreateManyInput[] => [
  {
    id: fixtureOfflineId.offline1,
    title: "Offline #1",
    publishedAt: new Date("2024-10-09T10:00:00+02:00"),
    fileUrl: "https://cdn.online.ntnu.no/offlines%2F1755548127981-84be895a-4a9e-4e8b-9022-a5dd9dc611a9-offline.pdf",
    imageUrl: "https://cdn.online.ntnu.no/%2F1755548127189-73d76690-bfeb-4853-a1e2-2e9dab24e620-offline.png",
  },
  {
    id: fixtureOfflineId.offline2,
    title: "Offline #2",
    publishedAt: new Date("2025-10-09T10:00:00+02:00"),
    fileUrl: "https://cdn.online.ntnu.no/offlines%2F1755548205782-cb9208d2-86cc-4bc5-b0ca-f89b054f2688-offline.pdf",
    imageUrl: "https://cdn.online.ntnu.no/%2F1755548205112-8db14835-55b5-41e0-8489-6cb201768b9e-offline.png",
  },
]
