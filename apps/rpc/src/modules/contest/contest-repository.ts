import type { DBHandle } from "@dotkomonline/db"
import {
  type Contest,
  type ContestId,
  ContestSchema,
  type ContestWrite,
  type Contestant,
  type ContestantId,
  ContestantSchema,
  type ContestantDetail,
  ContestantDetailSchema,
  type ContestantWrite,
  type ContestTeam,
  ContestTeamSchema,
} from "@dotkomonline/types"
import { parseOrReport } from "../../invariant"
import { type Pageable, pageQuery } from "@dotkomonline/utils"

export interface ContestRepository {
  findById(handle: DBHandle, contestId: ContestId): Promise<Contest | null>
  findMany(handle: DBHandle, page: Pageable): Promise<Contest[]>
  create(handle: DBHandle, data: ContestWrite): Promise<Contest>
  update(handle: DBHandle, contestId: ContestId, data: Partial<ContestWrite>): Promise<Contest>
  delete(handle: DBHandle, contestId: ContestId): Promise<void>
  setWinner(handle: DBHandle, contestId: ContestId, contestantId: string | null): Promise<Contest>

  findContestantById(handle: DBHandle, contestantId: ContestantId): Promise<Contestant | null>
  findContestantsByContestId(handle: DBHandle, contestId: ContestId): Promise<Contestant[]>
  findContestantsWithDetailsByContestId(handle: DBHandle, contestId: ContestId): Promise<ContestantDetail[]>
  createContestant(handle: DBHandle, data: ContestantWrite): Promise<Contestant>
  updateContestant(handle: DBHandle, contestantId: ContestantId, data: Partial<ContestantWrite>): Promise<Contestant>
  deleteContestant(handle: DBHandle, contestantId: ContestantId): Promise<void>

  createTeam(handle: DBHandle, contestantId: string, name: string, memberIds: string[]): Promise<ContestTeam>
  findTeamByContestantId(handle: DBHandle, contestantId: string): Promise<ContestTeam | null>
  deleteTeam(handle: DBHandle, contestantId: string): Promise<void>
}

export function getContestRepository(): ContestRepository {
  return {
    async findById(handle, contestId) {
      const contest = await handle.contest.findUnique({ where: { id: contestId } })
      return parseOrReport(ContestSchema.nullable(), contest)
    },

    async findMany(handle, page) {
      const contests = await handle.contest.findMany({ ...pageQuery(page) })
      return parseOrReport(ContestSchema.array(), contests)
    },

    async create(handle, data) {
      const contest = await handle.contest.create({ data })
      return parseOrReport(ContestSchema, contest)
    },

    async update(handle, contestId, data) {
      const contest = await handle.contest.update({ where: { id: contestId }, data })
      return parseOrReport(ContestSchema, contest)
    },

    async delete(handle, contestId) {
      await handle.contest.delete({ where: { id: contestId } })
    },

    async setWinner(handle, contestId, contestantId) {
      const contest = await handle.contest.update({
        where: { id: contestId },
        data: { winnerContestantId: contestantId },
      })
      return parseOrReport(ContestSchema, contest)
    },

    async findContestantById(handle, contestantId) {
      const contestant = await handle.contestant.findUnique({ where: { id: contestantId } })
      return parseOrReport(ContestantSchema.nullable(), contestant)
    },

    async findContestantsByContestId(handle, contestId) {
      const contestants = await handle.contestant.findMany({ where: { contestId } })
      return parseOrReport(ContestantSchema.array(), contestants)
    },

    async findContestantsWithDetailsByContestId(handle, contestId) {
      const contestants = await handle.contestant.findMany({
        where: { contestId },
        include: {
          team: { include: { members: { select: { id: true, name: true } } } },
          user: { select: { id: true, name: true } },
        },
      })
      return parseOrReport(ContestantDetailSchema.array(), contestants)
    },

    async createContestant(handle, data) {
      const contestant = await handle.contestant.create({ data })
      return parseOrReport(ContestantSchema, contestant)
    },

    async updateContestant(handle, contestantId, data) {
      const contestant = await handle.contestant.update({ where: { id: contestantId }, data })
      return parseOrReport(ContestantSchema, contestant)
    },

    async deleteContestant(handle, contestantId) {
      await handle.contestant.delete({ where: { id: contestantId } })
    },

    async createTeam(handle, contestantId, name, memberIds) {
      const team = await handle.contestTeam.create({
        data: {
          name,
          contestantId,
          members: { connect: memberIds.map((id) => ({ id })) },
        },
      })
      return parseOrReport(ContestTeamSchema, team)
    },

    async findTeamByContestantId(handle, contestantId) {
      const team = await handle.contestTeam.findUnique({ where: { contestantId } })
      return parseOrReport(ContestTeamSchema.nullable(), team)
    },

    async deleteTeam(handle, contestantId) {
      await handle.contestTeam.delete({ where: { contestantId } })
    },
  }
}
