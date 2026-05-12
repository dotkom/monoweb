import type { DBHandle } from "@dotkomonline/db"
import type {
  Contest,
  ContestId,
  Contestant,
  ContestantDetail,
  ContestantDetailDb,
  ContestantId,
  ContestWrite,
  ContestTeamDetail,
} from "./contest"
import { InvalidArgumentError, NotFoundError } from "../../error"
import type { Pageable } from "@dotkomonline/utils"
import type { ContestRepository, UpdateContestTeamData } from "./contest-repository"

function enrichContestantDetails(contestants: ContestantDetailDb[]): ContestantDetail[] {
  return contestants.map((contestant) => {
    let team: ContestTeamDetail | null = null

    if (contestant.team !== null) {
      team = {
        ...contestant.team,
        memberCount: contestant.team.members.length,
      }
    }

    const participantCount = contestant.userId !== null ? 1 : team !== null ? team.memberCount : 0

    return {
      ...contestant,
      team,
      participantCount,
    }
  })
}

export function sanitizeContestantDetailsForPublic(contestants: ContestantDetail[]): ContestantDetail[] {
  return contestants.map((contestant) => {
    let team: ContestTeamDetail | null = null

    if (contestant.team !== null) {
      team = {
        ...contestant.team,
        members: [],
      }
    }

    return {
      ...contestant,
      user: null,
      team,
    }
  })
}

function collectUserIdsFromContestantRow(row: ContestantDetailDb): Set<string> {
  const userIds = new Set<string>()

  if (row.userId !== null) {
    userIds.add(row.userId)
  }

  if (row.team !== null) {
    for (const member of row.team.members) {
      userIds.add(member.id)
    }
  }

  return userIds
}

function getParticipatingUserIdsFromOtherContestants(
  rows: ContestantDetailDb[],
  excludeContestantId: ContestantId
): Set<string> {
  const occupied = new Set<string>()

  for (const row of rows) {
    if (row.id === excludeContestantId) {
      continue
    }

    for (const userId of collectUserIdsFromContestantRow(row)) {
      occupied.add(userId)
    }
  }

  return occupied
}

function getAllParticipatingUserIds(rows: ContestantDetailDb[]): Set<string> {
  const occupied = new Set<string>()

  for (const row of rows) {
    for (const userId of collectUserIdsFromContestantRow(row)) {
      occupied.add(userId)
    }
  }

  return occupied
}

export interface ContestService {
  create(handle: DBHandle, data: ContestWrite): Promise<Contest>
  update(handle: DBHandle, contestId: ContestId, data: Partial<ContestWrite>): Promise<Contest>
  delete(handle: DBHandle, contestId: ContestId): Promise<void>
  getById(handle: DBHandle, contestId: ContestId): Promise<Contest>
  findById(handle: DBHandle, contestId: ContestId): Promise<Contest | null>
  findMany(handle: DBHandle, page: Pageable): Promise<Contest[]>
  setWinner(handle: DBHandle, contestId: ContestId, contestantId: ContestantId | null): Promise<Contest>

  getContestantById(handle: DBHandle, contestantId: ContestantId): Promise<Contestant>
  addUserContestant(handle: DBHandle, contestId: ContestId, userId: string): Promise<Contestant>
  addTeamContestant(handle: DBHandle, contestId: ContestId, teamName: string, memberIds: string[]): Promise<Contestant>
  updateTeamContestant(handle: DBHandle, contestantId: ContestantId, data: UpdateContestTeamData): Promise<Contestant>
  updateContestantResult(handle: DBHandle, contestantId: ContestantId, resultValue: number | null): Promise<Contestant>
  removeContestant(handle: DBHandle, contestantId: ContestantId): Promise<void>

  getContestWithContestants(
    handle: DBHandle,
    contestId: ContestId
  ): Promise<{ contest: Contest; contestants: ContestantDetail[] }>
}

export function getContestService(contestRepository: ContestRepository): ContestService {
  return {
    async findById(handle, contestId) {
      return await contestRepository.findById(handle, contestId)
    },

    async getById(handle, contestId) {
      const contest = await this.findById(handle, contestId)

      if (!contest) {
        throw new NotFoundError(`Contest(ID=${contestId}) not found`)
      }

      return contest
    },

    async getContestantById(handle, contestantId) {
      const contestant = await contestRepository.findContestantById(handle, contestantId)

      if (!contestant) {
        throw new NotFoundError(`Contestant(ID=${contestantId}) not found`)
      }

      return contestant
    },

    async findMany(handle, page) {
      return await contestRepository.findMany(handle, page)
    },

    async create(handle, data) {
      return await contestRepository.create(handle, data)
    },

    async update(handle, contestId, data) {
      return await contestRepository.update(handle, contestId, data)
    },

    async delete(handle, contestId) {
      await this.getById(handle, contestId)
      await contestRepository.delete(handle, contestId)
    },

    async setWinner(handle, contestId, contestantId) {
      if (contestantId !== null) {
        const contestant = await this.getContestantById(handle, contestantId)

        if (contestant.contestId !== contestId) {
          throw new InvalidArgumentError(`Contestant(ID=${contestantId}) does not belong to Contest(ID=${contestId})`)
        }
      }

      return await contestRepository.setWinner(handle, contestId, contestantId)
    },

    async addUserContestant(handle, contestId, userId) {
      const rows = await contestRepository.findContestantsWithDetailsByContestId(handle, contestId)
      const occupiedUserIds = getAllParticipatingUserIds(rows)

      if (occupiedUserIds.has(userId)) {
        throw new InvalidArgumentError(`User(ID=${userId}) is already participating in Contest(ID=${contestId})`)
      }

      return await contestRepository.createContestant(handle, { contestId, userId, resultValue: null })
    },

    async addTeamContestant(handle, contestId, teamName, memberIds) {
      const uniqueMemberIds = new Set(memberIds)

      if (uniqueMemberIds.size !== memberIds.length) {
        throw new InvalidArgumentError("Each user can only appear once on a team")
      }

      const rows = await contestRepository.findContestantsWithDetailsByContestId(handle, contestId)
      const occupiedUserIds = getAllParticipatingUserIds(rows)

      for (const memberId of memberIds) {
        if (occupiedUserIds.has(memberId)) {
          throw new InvalidArgumentError(`User(ID=${memberId}) is already participating in Contest(ID=${contestId})`)
        }
      }

      const contestant = await contestRepository.createContestant(handle, {
        contestId,
        userId: null,
        resultValue: null,
      })

      await contestRepository.createTeam(handle, contestant.id, teamName, memberIds)

      return contestant
    },

    async updateTeamContestant(handle, contestantId, data) {
      const contestant = await this.getContestantById(handle, contestantId)

      if (data.teamName === undefined && data.memberIds === undefined) {
        throw new InvalidArgumentError("At least one of teamName or memberIds must be provided")
      }

      const team = await contestRepository.findTeamByContestantId(handle, contestantId)

      if (team === null) {
        throw new InvalidArgumentError(`Contestant(ID=${contestantId}) is not a team contestant`)
      }

      if (data.memberIds !== undefined) {
        const uniqueMemberIds = new Set(data.memberIds)

        if (uniqueMemberIds.size !== data.memberIds.length) {
          throw new InvalidArgumentError("Each user can only appear once on a team")
        }

        const rows = await contestRepository.findContestantsWithDetailsByContestId(handle, contestant.contestId)
        const occupiedByOtherContestants = getParticipatingUserIdsFromOtherContestants(rows, contestantId)

        for (const memberId of data.memberIds) {
          if (occupiedByOtherContestants.has(memberId)) {
            throw new InvalidArgumentError(
              `User(ID=${memberId}) is already participating in Contest(ID=${contestant.contestId})`
            )
          }
        }
      }

      await contestRepository.updateTeam(handle, contestantId, data)

      return await this.getContestantById(handle, contestantId)
    },

    async updateContestantResult(handle, contestantId, resultValue) {
      return await contestRepository.updateContestant(handle, contestantId, { resultValue })
    },

    async removeContestant(handle, contestantId) {
      await contestRepository.deleteContestant(handle, contestantId)
    },

    async getContestWithContestants(handle, contestId) {
      const contest = await this.getById(handle, contestId)
      const rows = await contestRepository.findContestantsWithDetailsByContestId(handle, contestId)
      const contestants = enrichContestantDetails(rows)

      return { contest, contestants }
    },
  }
}
