import type { DBHandle } from "@dotkomonline/db"
import type {
  Mark,
  MarkId,
  PersonalMark,
  PersonalMarkDetails,
  Punishment,
  UserId,
  VisiblePersonalMarkDetails,
} from "@dotkomonline/types"
import { getExpiryDate, unique } from "@dotkomonline/utils"
import { isPast } from "date-fns"
import type { GroupService } from "../group/group-service"
import type { MarkService } from "./mark-service"
import { PersonalMarkNotFoundError } from "./personal-mark-error"
import type { PersonalMarkRepository } from "./personal-mark-repository"

export interface PersonalMarkService {
  findPersonalMarksByMark(handle: DBHandle, markId: MarkId): Promise<PersonalMark[]>
  findPersonalMarkDetails(handle: DBHandle, markId: MarkId): Promise<PersonalMarkDetails[]>
  findMarksByUserId(handle: DBHandle, userId: UserId): Promise<PersonalMark[]>
  findPersonalMarksByUserId(handle: DBHandle, userId: UserId): Promise<Mark[]>
  addToUser(handle: DBHandle, userId: UserId, markId: MarkId, givenById: UserId): Promise<PersonalMark>
  /**
   * Remove a personal mark from a user
   *
   * @throws {PersonalMarkNotFoundError} if the personal mark does not exist
   */
  removeFromUser(handle: DBHandle, userId: UserId, markId: MarkId): Promise<PersonalMark>
  listVisibleInformationForUser(handle: DBHandle, userId: UserId): Promise<VisiblePersonalMarkDetails[]>
  countUsersByMarkId(handle: DBHandle, markId: MarkId): Promise<number>
  getUserPunishment(handle: DBHandle, userId: UserId): Promise<Punishment | null>
}

export function getPersonalMarkService(
  personalMarkRepository: PersonalMarkRepository,
  markService: MarkService,
  groupService: GroupService
): PersonalMarkService {
  return {
    async findPersonalMarksByMark(handle, markId) {
      return await personalMarkRepository.getByMarkId(handle, markId)
    },
    async findPersonalMarkDetails(handle, markId) {
      return await personalMarkRepository.getDetailsByMarkId(handle, markId)
    },
    async findPersonalMarksByUserId(handle, userId) {
      return await personalMarkRepository.getAllMarksByUserId(handle, userId)
    },
    async findMarksByUserId(handle, userId) {
      return await personalMarkRepository.getAllByUserId(handle, userId)
    },
    async addToUser(handle, userId, markId, givenById) {
      const mark = await markService.getMark(handle, markId)
      return await personalMarkRepository.addToUserId(handle, userId, mark.id, givenById)
    },
    async listVisibleInformationForUser(handle, userId) {
      const personalMarks = await personalMarkRepository.getAllByUserId(handle, userId)
      const marks = await markService.getMany(
        handle,
        personalMarks.map(({ markId }) => markId)
      )
      const groups = await groupService.getMany(handle, unique(marks.map((m) => m.groupSlug)))

      return personalMarks.map(({ givenById: _, ...personalMark }): VisiblePersonalMarkDetails => {
        const mark = marks.find((mark) => mark.id === personalMark.markId)
        const givenByGroup = groups.find((group) => group.slug === mark?.groupSlug)

        if (!mark || !givenByGroup) {
          throw new PersonalMarkNotFoundError("Failed to find group and mark for personalMark")
        }

        return {
          mark,
          givenByGroup,
          personalMark,
        }
      })
    },
    async removeFromUser(handle, userId, markId) {
      const personalMark = await personalMarkRepository.removeFromUserId(handle, userId, markId)
      if (!personalMark) {
        throw new PersonalMarkNotFoundError(markId)
      }
      return personalMark
    },
    async countUsersByMarkId(handle, markId) {
      return await personalMarkRepository.countUsersByMarkId(handle, markId)
    },
    async getUserPunishment(handle, userId) {
      const personalMarks = await personalMarkRepository.getAllByUserId(handle, userId)
      const marks = await markService.getMany(
        handle,
        personalMarks.map((pm) => pm.markId)
      )

      const currentMarkWeight = personalMarks.reduce((acc, pm) => {
        const mark = marks.find((m) => m.id === pm.markId)

        if (!mark) return acc
        if (isPast(getExpiryDate(pm.createdAt, mark.duration))) return acc

        return acc + mark.weight
      }, 0)

      if (currentMarkWeight >= 6) {
        return { suspended: true }
      }

      if (currentMarkWeight >= 3) {
        return { delay: 24 }
      }

      if (currentMarkWeight === 2) {
        return { delay: 4 }
      }

      if (currentMarkWeight === 1) {
        return { delay: 1 }
      }

      return null
    },
  }
}
