import type { Prisma } from "@prisma/client"

export const getInterestGroupFixtures: () => Prisma.InterestGroupCreateManyInput[] = () => [
  {
    updatedAt: new Date("2023-01-25 19:58:43.138389+00"),
    name: "testWithLink",
    createdAt: new Date("2023-01-25 19:58:43.138389+00"),
    description: "description",
    link: "https://onlinentnu.slack.com/archives/C03S8TX1L",
    isActive: true,
  },
  {
    updatedAt: new Date("2023-01-25 20:05:31.034217+00"),
    name: "testWithoutLink",
    createdAt: new Date("2023-01-25 20:05:31.034217+00"),
    description: "description",
    isActive: true,
  },
  {
    updatedAt: new Date("2023-01-25 20:05:31.034217+00"),
    name: "testIsTrue (should be false)",
    createdAt: new Date("2023-01-25 20:05:31.034217+00"),
    description: "description",
    isActive: false,
  },
]
