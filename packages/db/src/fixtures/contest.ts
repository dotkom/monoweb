import type { Prisma } from "../"
import { ContestResultOrderSchema, ContestResultTypeSchema } from "../../generated/schema/index"
import { getFadderukeInterval } from "./event"

export const FADDERUKE_CONTEST_ID = "e368a124-4394-40ea-8354-928a97902e51"

export const getContestFixture = (): Prisma.ContestCreateInput => ({
  id: FADDERUKE_CONTEST_ID,
  name: "Onlinelekene",
  description:
    "Konkurransen under fadderukene. Samle poeng på arrangementer og aktiviteter gjennom uken, og se hvem som topper pallen!",
  startDate: getFadderukeInterval().start,
  resultType: ContestResultTypeSchema.enum.SCORE,
  resultOrder: ContestResultOrderSchema.enum.DESC,
  groups: {
    connect: [{ slug: "velkom" }],
  },
})

type ContestTeamFixture = {
  contestant: Prisma.ContestantCreateManyInput & { id: string }
  team: {
    id: string
    name: string
    contestantId: string
    memberUserIds: string[]
  }
}

export const getContestTeamFixtures = (userIds: string[]): ContestTeamFixture[] => [
  {
    contestant: {
      id: "a8f3c2d1-4e5b-6a7c-8d9e-0f1a2b3c4d5e",
      contestId: FADDERUKE_CONTEST_ID,
      userId: null,
      resultValue: 420,
    },
    team: {
      id: "b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e",
      name: "Klappørken",
      contestantId: "a8f3c2d1-4e5b-6a7c-8d9e-0f1a2b3c4d5e",
      memberUserIds: [userIds[0], userIds[1], userIds[2]],
    },
  },
  {
    contestant: {
      id: "c2d3e4f5-a6b7-8c9d-0e1f-2a3b4c5d6e7f",
      contestId: FADDERUKE_CONTEST_ID,
      userId: null,
      resultValue: 385,
    },
    team: {
      id: "d3e4f5a6-b7c8-9d0e-1f2a-3b4c5d6e7f8a",
      name: "Fadderflammen",
      contestantId: "c2d3e4f5-a6b7-8c9d-0e1f-2a3b4c5d6e7f",
      memberUserIds: [userIds[3], userIds[4]],
    },
  },
  {
    contestant: {
      id: "e4f5a6b7-c8d9-0e1f-2a3b-4c5d6e7f8a9b",
      contestId: FADDERUKE_CONTEST_ID,
      userId: null,
      resultValue: 360,
    },
    team: {
      id: "f5a6b7c8-d9e0-1f2a-3b4c-5d6e7f8a9b0c",
      name: "Moholt Mavericks",
      contestantId: "e4f5a6b7-c8d9-0e1f-2a3b-4c5d6e7f8a9b",
      memberUserIds: [userIds[5], userIds[6], userIds[7]],
    },
  },
  {
    contestant: {
      id: "a6b7c8d9-e0f1-2a3b-4c5d-6e7f8a9b0c1d",
      contestId: FADDERUKE_CONTEST_ID,
      userId: null,
      resultValue: 325,
    },
    team: {
      id: "b7c8d9e0-f1a2-3b4c-5d6e-7f8a9b0c1d2e",
      name: "Gløshaugen Gladiatorer",
      contestantId: "a6b7c8d9-e0f1-2a3b-4c5d-6e7f8a9b0c1d",
      memberUserIds: [userIds[8], userIds[9]],
    },
  },
  {
    contestant: {
      id: "c8d9e0f1-a2b3-4c5d-6e7f-8a9b0c1d2e3f",
      contestId: FADDERUKE_CONTEST_ID,
      userId: null,
      resultValue: 290,
    },
    team: {
      id: "d9e0f1a2-b3c4-5d6e-7f8a-9b0c1d2e3f40",
      name: "Realfagsrebus",
      contestantId: "c8d9e0f1-a2b3-4c5d-6e7f-8a9b0c1d2e3f",
      memberUserIds: [userIds[10]],
    },
  },
]
