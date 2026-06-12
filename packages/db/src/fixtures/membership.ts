import { getCurrentSemesterStart, getNextSemesterStart, isSpringSemester } from "@dotkomonline/utils"
import type { Prisma } from "../"

const isSpring = isSpringSemester()
const start = getCurrentSemesterStart()
const end = getNextSemesterStart()

export const getMembershipFixtures = (userIds: string[]) =>
  [
    {
      userId: userIds[0],
      start,
      type: "BACHELOR_STUDENT",
      specialization: null,
      end,
      semester: isSpring ? 3 : 4,
    },
    {
      userId: userIds[1],
      start,
      type: "KNIGHT",
      specialization: null,
      end: null,
    },
    {
      userId: userIds[2],
      start,
      type: "MASTER_STUDENT",
      specialization: "SOFTWARE_ENGINEERING",
      end,
      semester: isSpring ? 7 : 6,
    },
    {
      userId: userIds[3],
      start,
      type: "BACHELOR_STUDENT",
      specialization: null,
      end,
      semester: isSpring ? 1 : 2,
    },
    {
      userId: userIds[4],
      start,
      type: "BACHELOR_STUDENT",
      specialization: null,
      end,
      semester: isSpring ? 5 : 6,
    },
    {
      userId: userIds[5],
      start,
      type: "MASTER_STUDENT",
      specialization: "ARTIFICIAL_INTELLIGENCE",
      end,
      semester: isSpring ? 9 : 8,
    },
    {
      userId: userIds[6],
      start,
      type: "SOCIAL_MEMBER",
      specialization: null,
      end: null,
      semester: null,
    },
    {
      userId: userIds[7],
      start,
      type: "MASTER_STUDENT",
      specialization: "INTERACTION_DESIGN",
      end,
      semester: isSpring ? 7 : 6,
    },
    {
      userId: userIds[8],
      start,
      type: "BACHELOR_STUDENT",
      specialization: null,
      end,
      semester: isSpring ? 1 : 2,
    },
    {
      userId: userIds[9],
      start,
      type: "BACHELOR_STUDENT",
      specialization: null,
      end,
      semester: isSpring ? 3 : 4,
    },
    {
      userId: userIds[10],
      start,
      type: "MASTER_STUDENT",
      specialization: "DATABASE_AND_SEARCH",
      end,
      semester: isSpring ? 9 : 8,
    },
  ] as const satisfies Prisma.MembershipCreateManyInput[]
