import type { Prisma } from "@prisma/client"
import { getCurrentSemesterStart, getNextSemesterStart, isSpringSemester } from "@dotkomonline/utils"

const isSpring = isSpringSemester()
const start = getCurrentSemesterStart()
const end = getNextSemesterStart()

export const getMembershipFixtures = (userIds: string[]) =>
  [
    {
      userId: userIds[0],
      start,
      type: "BACHELOR_STUDENT",
      end,
      semester: isSpring ? 3 : 4,
    },
    {
      userId: userIds[1],
      start,
      type: "KNIGHT",
      end,
    },
    {
      userId: userIds[2],
      start,
      type: "MASTER_STUDENT",
      end,
      specialization: "SOFTWARE_ENGINEERING",
      semester: isSpring ? 7 : 6,
    },
  ] as const satisfies Prisma.MembershipCreateManyInput[]
