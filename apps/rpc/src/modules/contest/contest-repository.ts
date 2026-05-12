import type { DBHandle, Prisma } from "@dotkomonline/db"
import {
  type Contest,
  type ContestId,
  ContestSchema,
  type ContestWrite,
  type Contestant,
  type ContestantId,
  ContestantSchema,
  type ContestantDetailDb,
  ContestantDetailDbSchema,
  type ContestantWrite,
  type ContestTeam,
  ContestTeamSchema,
} from "./contest"
import { parseOrReport } from "../../invariant"
import { type Pageable, pageQuery } from "@dotkomonline/utils"

const contestGroupsInclude = {
  groups: {
    select: {
      slug: true,
    },
  },
} satisfies Prisma.ContestInclude

type ContestWithGroups = Prisma.ContestGetPayload<{
  include: typeof contestGroupsInclude
}>

function mapDbContestToApi(row: ContestWithGroups): Contest {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    startDate: row.startDate,
    resultType: row.resultType,
    resultOrder: row.resultOrder,
    groups: row.groups.map((group) => group.slug),
    winnerContestantId: row.winnerContestantId,
  }
}

export type UpdateContestTeamData = {
  teamName?: string
  memberIds?: string[]
}

export interface ContestRepository {
  create(handle: DBHandle, data: ContestWrite): Promise<Contest>
  update(handle: DBHandle, contestId: ContestId, data: Partial<ContestWrite>): Promise<Contest>
  delete(handle: DBHandle, contestId: ContestId): Promise<void>
  findById(handle: DBHandle, contestId: ContestId): Promise<Contest | null>
  findMany(handle: DBHandle, page: Pageable): Promise<Contest[]>
  setWinner(handle: DBHandle, contestId: ContestId, contestantId: string | null): Promise<Contest>

  createContestant(handle: DBHandle, data: ContestantWrite): Promise<Contestant>
  updateContestant(handle: DBHandle, contestantId: ContestantId, data: Partial<ContestantWrite>): Promise<Contestant>
  deleteContestant(handle: DBHandle, contestantId: ContestantId): Promise<void>
  findContestantById(handle: DBHandle, contestantId: ContestantId): Promise<Contestant | null>
  findContestantsByContestId(handle: DBHandle, contestId: ContestId): Promise<Contestant[]>
  findContestantsWithDetailsByContestId(handle: DBHandle, contestId: ContestId): Promise<ContestantDetailDb[]>

  createTeam(handle: DBHandle, contestantId: string, name: string, memberIds: string[]): Promise<ContestTeam>
  updateTeam(handle: DBHandle, contestantId: string, data: UpdateContestTeamData): Promise<ContestTeam>
  deleteTeam(handle: DBHandle, contestantId: string): Promise<void>
  findTeamByContestantId(handle: DBHandle, contestantId: string): Promise<ContestTeam | null>
}

export function getContestRepository(): ContestRepository {
  return {
    async findById(handle, contestId) {
      const contest = await handle.contest.findUnique({
        where: {
          id: contestId,
        },
        include: contestGroupsInclude,
      })

      if (contest === null) {
        return null
      }

      return parseOrReport(ContestSchema, mapDbContestToApi(contest))
    },

    async findMany(handle, page) {
      const contests = await handle.contest.findMany({
        ...pageQuery(page),
        include: contestGroupsInclude,
      })

      return parseOrReport(ContestSchema.array(), contests.map(mapDbContestToApi))
    },

    async create(handle, data) {
      const { groups, ...rest } = data

      const contest = await handle.contest.create({
        data: {
          name: rest.name,
          description: rest.description,
          startDate: rest.startDate,
          resultType: rest.resultType,
          resultOrder: rest.resultOrder,
          groups: {
            connect: groups.map((slug) => ({ slug })),
          },
        },
        include: contestGroupsInclude,
      })

      return parseOrReport(ContestSchema, mapDbContestToApi(contest))
    },

    async update(handle, contestId, data) {
      const { groups, ...fields } = data

      const contest = await handle.contest.update({
        where: {
          id: contestId,
        },
        data: {
          ...fields,
          ...(groups !== undefined && {
            groups: {
              set: groups.map((slug) => ({ slug })),
            },
          }),
        },
        include: contestGroupsInclude,
      })

      return parseOrReport(ContestSchema, mapDbContestToApi(contest))
    },

    async delete(handle, contestId) {
      await handle.contest.delete({
        where: {
          id: contestId,
        },
      })
    },

    async setWinner(handle, contestId, contestantId) {
      const contest = await handle.contest.update({
        where: {
          id: contestId,
        },
        data: {
          winnerContestantId: contestantId,
        },
        include: contestGroupsInclude,
      })

      return parseOrReport(ContestSchema, mapDbContestToApi(contest))
    },

    async findContestantById(handle, contestantId) {
      const contestant = await handle.contestant.findUnique({
        where: {
          id: contestantId,
        },
      })

      return parseOrReport(ContestantSchema.nullable(), contestant)
    },

    async findContestantsByContestId(handle, contestId) {
      const contestants = await handle.contestant.findMany({
        where: {
          contestId,
        },
      })

      return parseOrReport(ContestantSchema.array(), contestants)
    },

    async findContestantsWithDetailsByContestId(handle, contestId) {
      const contestants = await handle.contestant.findMany({
        where: { contestId },
        include: {
          team: {
            include: {
              members: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  username: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              username: true,
            },
          },
        },
      })

      return parseOrReport(ContestantDetailDbSchema.array(), contestants)
    },

    async createContestant(handle, data) {
      const contestant = await handle.contestant.create({
        data,
      })

      return parseOrReport(ContestantSchema, contestant)
    },

    async updateContestant(handle, contestantId, data) {
      const contestant = await handle.contestant.update({
        data,
        where: {
          id: contestantId,
        },
      })

      return parseOrReport(ContestantSchema, contestant)
    },

    async deleteContestant(handle, contestantId) {
      await handle.contestant.delete({
        where: {
          id: contestantId,
        },
      })
    },

    async createTeam(handle, contestantId, name, memberIds) {
      const team = await handle.contestTeam.create({
        data: {
          name,
          contestantId,
          members: {
            connect: memberIds.map((id) => ({ id })),
          },
        },
      })

      return parseOrReport(ContestTeamSchema, team)
    },

    async updateTeam(handle, contestantId, data) {
      const updatePayload: Prisma.ContestTeamUpdateInput = {}

      if (data.teamName !== undefined) {
        updatePayload.name = data.teamName
      }

      if (data.memberIds !== undefined) {
        updatePayload.members = {
          set: data.memberIds.map((memberId) => ({ id: memberId })),
        }
      }

      const team = await handle.contestTeam.update({
        data: updatePayload,
        where: {
          contestantId,
        },
      })

      return parseOrReport(ContestTeamSchema, team)
    },

    async findTeamByContestantId(handle, contestantId) {
      const team = await handle.contestTeam.findUnique({
        where: {
          contestantId,
        },
      })

      return parseOrReport(ContestTeamSchema.nullable(), team)
    },

    async deleteTeam(handle, contestantId) {
      await handle.contestTeam.delete({
        where: {
          contestantId,
        },
      })
    },
  }
}
