import type { Mark, MarkId, PersonalMark, UserId } from "@dotkomonline/types"
import { add, compareAsc, isBefore, isPast, isWithinInterval, set } from "date-fns"
import type { MarkService } from "./mark-service"
import { PersonalMarkNotFoundError } from "./personal-mark-error"
import type { PersonalMarkRepository } from "./personal-mark-repository"

export interface PersonalMarkService {
  getPersonalMarksByMarkId(markId: MarkId): Promise<PersonalMark[]>
  getPersonalMarksForUserId(userId: UserId): Promise<PersonalMark[]>
  getMarksForUserId(userId: UserId): Promise<Mark[]>
  addPersonalMarkToUserId(userId: UserId, markId: MarkId): Promise<PersonalMark>
  removePersonalMarkFromUserId(userId: UserId, markId: MarkId): Promise<PersonalMark>
  countUsersByMarkId(markId: MarkId): Promise<number>
  getExpiryDateForUserId(userId: UserId): Promise<Date | null>
  calculateExpiryDate(marks: Pick<Mark, "createdAt" | "duration">[]): Date | null
}

export class PersonalMarkServiceImpl implements PersonalMarkService {
  private readonly personalMarkRepository: PersonalMarkRepository
  private readonly markService: MarkService

  constructor(personalMarkRepository: PersonalMarkRepository, markService: MarkService) {
    this.personalMarkRepository = personalMarkRepository
    this.markService = markService
  }

  public async getPersonalMarksForUserId(userId: UserId) {
    const personalMarks = await this.personalMarkRepository.getAllByUserId(userId)
    return personalMarks
  }

  public async getMarksForUserId(userId: UserId) {
    const personalMarks = await this.personalMarkRepository.getAllMarksByUserId(userId)
    return personalMarks
  }

  public async getPersonalMarksByMarkId(markId: MarkId) {
    const personalMarks = await this.personalMarkRepository.getByMarkId(markId)
    return personalMarks
  }

  public async addPersonalMarkToUserId(userId: UserId, markId: MarkId) {
    const mark = await this.markService.getMark(markId)
    const personalMark = await this.personalMarkRepository.addToUserId(userId, mark.id)
    return personalMark
  }

  /**
   * Remove a personal mark from a user
   *
   * @throws {PersonalMarkNotFoundError} if the personal mark does not exist
   */
  public async removePersonalMarkFromUserId(userId: UserId, markId: MarkId) {
    const personalMark = await this.personalMarkRepository.removeFromUserId(userId, markId)
    if (!personalMark) {
      throw new PersonalMarkNotFoundError(markId)
    }
    return personalMark
  }

  public async countUsersByMarkId(markId: MarkId) {
    const count = await this.personalMarkRepository.countUsersByMarkId(markId)
    return count
  }

  public async getExpiryDateForUserId(userId: UserId) {
    const personalMarks = await this.personalMarkRepository.getAllByUserId(userId)
    const marks = await Promise.all(personalMarks.map(async (mark) => this.markService.getMark(mark.markId)))
    const expiryDate = this.calculateExpiryDate(marks)
    return expiryDate
  }

  public async isUserMarked(userId: UserId) {
    return (await this.getExpiryDateForUserId(userId)) !== null
  }

  public adjustDateIfStartingInHoliday(date: Date) {
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

  public adjustDateIfEndingInHoliday(date: Date) {
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

  public calculateExpiryDate(marks: { createdAt: Date; duration: number }[]) {
    const sortedMarks = marks.toSorted((a, b) => compareAsc(a.createdAt, b.createdAt))
    let endDate: Date | null = null

    for (const mark of sortedMarks) {
      const date =
        endDate && isBefore(mark.createdAt, endDate)
          ? new Date(this.adjustDateIfStartingInHoliday(endDate).getTime())
          : new Date(this.adjustDateIfStartingInHoliday(mark.createdAt).getTime())
      date.setDate(date.getDate() + mark.duration)

      endDate = this.adjustDateIfEndingInHoliday(date)
    }

    if (!endDate || isPast(endDate)) {
      return null
    }

    return endDate
  }
}
