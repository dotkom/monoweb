import { getCurrentSemesterStart, getNextSemesterStart, isSpringSemester } from "@dotkomonline/utils"
import type { Prisma } from "../"
import { userId } from "./user"

export const fixtureMembershipId = {
  anders: "m1000001-0000-4000-8000-000000000001",
  berta: "m1000002-0000-4000-8000-000000000002",
  carl: "m1000003-0000-4000-8000-000000000003",
  dina: "m1000004-0000-4000-8000-000000000004",
  eirik: "m1000005-0000-4000-8000-000000000005",
  frida: "m1000006-0000-4000-8000-000000000006",
  gunnar: "m1000007-0000-4000-8000-000000000007",
  helle: "m1000008-0000-4000-8000-000000000008",
  ivar: "m1000009-0000-4000-8000-000000000009",
  jenny: "m1000010-0000-4000-8000-000000000010",
  kasper: "m1000011-0000-4000-8000-000000000011",
} as const

const isSpring = isSpringSemester()
const start = getCurrentSemesterStart()
const end = getNextSemesterStart()

export const getMembershipFixtures = () =>
  [
    {
      id: fixtureMembershipId.anders,
      userId: userId("anders"),
      start,
      type: "BACHELOR_STUDENT",
      specialization: null,
      end,
      semester: isSpring ? 3 : 4,
    },
    {
      id: fixtureMembershipId.berta,
      userId: userId("berta"),
      start,
      type: "KNIGHT",
      specialization: null,
      end: null,
    },
    {
      id: fixtureMembershipId.carl,
      userId: userId("carl"),
      start,
      type: "MASTER_STUDENT",
      specialization: "SOFTWARE_ENGINEERING",
      end,
      semester: isSpring ? 7 : 6,
    },
    {
      id: fixtureMembershipId.dina,
      userId: userId("dina"),
      start,
      type: "BACHELOR_STUDENT",
      specialization: null,
      end,
      semester: isSpring ? 1 : 2,
    },
    {
      id: fixtureMembershipId.eirik,
      userId: userId("eirik"),
      start,
      type: "BACHELOR_STUDENT",
      specialization: null,
      end,
      semester: isSpring ? 5 : 6,
    },
    {
      id: fixtureMembershipId.frida,
      userId: userId("frida"),
      start,
      type: "MASTER_STUDENT",
      specialization: "ARTIFICIAL_INTELLIGENCE",
      end,
      semester: isSpring ? 9 : 8,
    },
    {
      id: fixtureMembershipId.gunnar,
      userId: userId("gunnar"),
      start,
      type: "SOCIAL_MEMBER",
      specialization: null,
      end: null,
      semester: null,
    },
    {
      id: fixtureMembershipId.helle,
      userId: userId("helle"),
      start,
      type: "MASTER_STUDENT",
      specialization: "INTERACTION_DESIGN",
      end,
      semester: isSpring ? 7 : 6,
    },
    {
      id: fixtureMembershipId.ivar,
      userId: userId("ivar"),
      start,
      type: "BACHELOR_STUDENT",
      specialization: null,
      end,
      semester: isSpring ? 1 : 2,
    },
    {
      id: fixtureMembershipId.jenny,
      userId: userId("jenny"),
      start,
      type: "BACHELOR_STUDENT",
      specialization: null,
      end,
      semester: isSpring ? 3 : 4,
    },
    {
      id: fixtureMembershipId.kasper,
      userId: userId("kasper"),
      start,
      type: "MASTER_STUDENT",
      specialization: "DATABASE_AND_SEARCH",
      end,
      semester: isSpring ? 9 : 8,
    },
  ] as const satisfies Prisma.MembershipCreateManyInput[]
