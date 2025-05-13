import type { Prisma } from "@prisma/client"

export const getMarkFixtures: () => Prisma.MarkCreateManyInput[] = () => [
  {
    updatedAt: new Date("2023-01-25 19:58:43.138389+00"),
    title: "a",
    createdAt: new Date("2023-01-25 19:58:43.138389+00"),
    description: "a",
    expiresAt: new Date("2023-01-30 19:58:43.138389+00"),
    amount: 1,
  },
  {
    updatedAt: new Date("2023-01-25 20:05:31.034217+00"),
    title: "a",
    createdAt: new Date("2023-01-25 20:05:31.034217+00"),
    description: "a",
    expiresAt: new Date("2023-01-30 20:05:31.034217+00"),
    amount: 1,
  },
]
