import type { DBHandle } from "@dotkomonline/db"
import type { DashboardPersonalMark, Mark, MarkId, PersonalMark, UserId } from "@dotkomonline/types"
import { add, compareAsc, isBefore, isPast, isWithinInterval, set } from "date-fns"
import type { MarkService } from "./mark-service"
import { PersonalMarkNotFoundError } from "./personal-mark-error"
import type { PersonalMarkRepository } from "./personal-mark-repository"

export interface PersonalMarkService {
  getPersonalMarksByMarkId(handle: DBHandle, markId: MarkId): Promise<PersonalMark[]>
  getDashboardPersonalMarksByMarkId(handle: DBHandle, markId: MarkId): Promise<DashboardPersonalMark[]>
  getPersonalMarksForUserId(handle: DBHandle, userId: UserId): Promise<PersonalMark[]>
  getMarksForUserId(handle: DBHandle, userId: UserId): Promise<Mark[]>
  addPersonalMarkToUserId(handle: DBHandle, userId: UserId, markId: MarkId, givenById: UserId): Promise<PersonalMark>
  /**
   * Remove a personal mark from a user
   *
   * @throws {PersonalMarkNotFoundError} if the personal mark does not exist
   */
  removePersonalMarkFromUserId(handle: DBHandle, userId: UserId, markId: MarkId): Promise<PersonalMark>
  countUsersByMarkId(handle: DBHandle, markId: MarkId): Promise<number>
  getExpiryDateForUserId(handle: DBHandle, userId: UserId): Promise<Date | null>
}

export function getPersonalMarkService(
  personalMarkRepository: PersonalMarkRepository,
  markService: MarkService
): PersonalMarkService {
  return {
    async getPersonalMarksByMarkId(handle, markId) {
      return await personalMarkRepository.getByMarkId(handle, markId)
    },
    async getDashboardPersonalMarksByMarkId(handle, markId) {
      return await personalMarkRepository.getDashboardByMarkId(handle, markId)
    },
    async getMarksForUserId(handle, userId) {
      return await personalMarkRepository.getAllMarksByUserId(handle, userId)
    },
    async getPersonalMarksForUserId(handle, userId) {
      return await personalMarkRepository.getAllByUserId(handle, userId)
    },
    async addPersonalMarkToUserId(handle, userId, markId, givenById) {
      const mark = await markService.getMark(handle, markId)
      return await personalMarkRepository.addToUserId(handle, userId, mark.id, givenById)
    },
    async removePersonalMarkFromUserId(handle, userId, markId) {
      const personalMark = await personalMarkRepository.removeFromUserId(handle, userId, markId)
      if (!personalMark) {
        throw new PersonalMarkNotFoundError(markId)
      }
      return personalMark
    },
    async countUsersByMarkId(handle, markId) {
      return await personalMarkRepository.countUsersByMarkId(handle, markId)
    },
    async getExpiryDateForUserId(handle, userId) {
      const personalMarks = await personalMarkRepository.getAllByUserId(handle, userId)
      const marks = await Promise.all(personalMarks.map(async (mark) => markService.getMark(handle, mark.markId)))
      return calculateExpiryDate(marks)
    },
  }
}

function calculateExpiryDate(marks: Mark[]) {
  const sortedMarks = marks.toSorted((a, b) => compareAsc(a.createdAt, b.createdAt))
  let endDate: Date | null = null

  for (const mark of sortedMarks) {
    const date =
      endDate && isBefore(mark.createdAt, endDate)
        ? new Date(adjustDateIfStartingInHoliday(endDate).getTime())
        : new Date(adjustDateIfStartingInHoliday(mark.createdAt).getTime())
    date.setDate(date.getDate() + mark.duration)

    endDate = adjustDateIfEndingInHoliday(date)
  }

  if (!endDate || isPast(endDate)) {
    return null
  }

  return endDate
}

function adjustDateIfStartingInHoliday(date: Date) {
  if (isWithinInterval(date, { start: new Date(date.getFullYear(), 5), end: new Date(date.getFullYear(), 7, 15) })) {
    return set(date, { month: 7, date: 15 })
  }
  if (date.getMonth() === 11) {
    return set(date, { year: date.getFullYear() + 1, month: 0, date: 15 })
  }
  if (date.getMonth() === 0 && date.getDate() < 15) {
    return set(date, { month: 0, date: 15 })
  }
  return date
}

function adjustDateIfEndingInHoliday(date: Date) {
  let additionalDays = 0
  if (isWithinInterval(date, { start: new Date(date.getFullYear(), 5), end: new Date(date.getFullYear(), 7, 15) })) {
    additionalDays = 75
  } else if (date.getMonth() === 11) {
    additionalDays = 45
  } else if (date.getMonth() === 0 && date.getDate() < 15) {
    additionalDays = 45
  }
  return add(date, { days: additionalDays })
}
