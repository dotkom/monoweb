import type { Prisma } from "@prisma/client"

export const getOfflineFixtures: () => Prisma.OfflineCreateManyInput[] = () => [
  {
    title: "Offline #1",
    publishedAt: new Date("2023-10-09T10:00:00+02:00"),
    fileUrl: null,
    imageUrl: null,
  },
  {
    title: "Offline #2",
    publishedAt: new Date("2023-10-09T10:00:00+02:00"),
    fileUrl: null,
    imageUrl: null,
  },
]
