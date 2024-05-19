import type { Mark, MarkId, PersonalMark, UserId } from "@dotkomonline/types"
import { add, compareAsc, isBefore, isWithinInterval, set } from "date-fns"
import type { Cursor } from "../../utils/cursor-pagination/deprecated-pagination"
import type { MarkService } from "./mark-service"
import { PersonalMarkNotFoundError } from "./personal-mark-error"
import type { PersonalMarkRepository } from "./personal-mark-repository"

export interface PersonalMarkService {
  getPersonalMarksByMarkId(markId: MarkId, take: number, cursor?: Cursor): Promise<PersonalMark[]>
  getPersonalMarksForUserId(userId: UserId, take: number, cursor?: Cursor): Promise<PersonalMark[]>
  getMarksForUserId(userId: UserId, take: number, cursor?: Cursor): Promise<Mark[]>
  addPersonalMarkToUserId(userId: UserId, markId: MarkId): Promise<PersonalMark>
  removePersonalMarkFromUserId(userId: UserId, markId: MarkId): Promise<PersonalMark>
  countUsersByMarkId(markId: MarkId): Promise<number>
  getExpiryDateForUserId(userId: UserId): Promise<Date | null>
  calculateExpiryDate(marks: { createdAt: Date; duration: number }[]): Date | null
}

export class PersonalMarkServiceImpl implements PersonalMarkService {
  constructor(
    private readonly personalMarkRepository: PersonalMarkRepository,
    private readonly markService: MarkService
  ) {}

  async getPersonalMarksForUserId(userId: UserId, take: number, cursor?: Cursor): Promise<PersonalMark[]> {
    const personalMarks = await this.personalMarkRepository.getAllByUserId(userId, take, cursor)
    return personalMarks
  }

  async getMarksForUserId(userId: UserId, take: number, cursor?: Cursor): Promise<Mark[]> {
    const personalMarks = await this.personalMarkRepository.getAllMarksByUserId(userId, take, cursor)
    return personalMarks
  }

  async getPersonalMarksByMarkId(markId: MarkId, take: number, cursor?: Cursor): Promise<PersonalMark[]> {
    const personalMarks = await this.personalMarkRepository.getByMarkId(markId, take, cursor)
    return personalMarks
  }

  async addPersonalMarkToUserId(userId: UserId, markId: MarkId): Promise<PersonalMark> {
    const mark = await this.markService.getMark(markId)
    const personalMark = await this.personalMarkRepository.addToUserId(userId, mark.id)
    return personalMark
  }

  /**
   * Remove a personal mark from a user
   *
   * @throws {PersonalMarkNotFoundError} if the personal mark does not exist
   */
  async removePersonalMarkFromUserId(userId: UserId, markId: MarkId): Promise<PersonalMark> {
    const personalMark = await this.personalMarkRepository.removeFromUserId(userId, markId)
    if (!personalMark) {
      throw new PersonalMarkNotFoundError(markId)
    }
    return personalMark
  }

  async countUsersByMarkId(markId: MarkId): Promise<number> {
    const count = await this.personalMarkRepository.countUsersByMarkId(markId)
    return count
  }

  async getExpiryDateForUserId(userId: UserId): Promise<Date | null> {
    const personalMarks = await this.personalMarkRepository.getAllByUserId(userId, 1000)
    const marks = await Promise.all(personalMarks.map(async (mark) => this.markService.getMark(mark.markId)))
    const expiryDate = this.calculateExpiryDate(marks)
    return expiryDate
  }

  async isUserMarked(userId: UserId): Promise<boolean> {
    return (await this.getExpiryDateForUserId(userId)) !== null
  }

  adjustDateIfStartingInHoliday(date: Date): Date {
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

  adjustDateIfEndingInHoliday(date: Date): Date {
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

  calculateExpiryDate(marks: { createdAt: Date; duration: number }[]): Date | null {
    const currentTime = new Date()
    let endDate: Date | null = null
    marks.sort((a, b) => compareAsc(a.createdAt, b.createdAt))

    for (const mark of marks) {
      const date =
        endDate && isBefore(mark.createdAt, endDate)
          ? new Date(this.adjustDateIfStartingInHoliday(endDate).getTime())
          : new Date(this.adjustDateIfStartingInHoliday(mark.createdAt).getTime())
      date.setDate(date.getDate() + mark.duration)

      endDate = this.adjustDateIfEndingInHoliday(date)
    }

    if (!endDate || endDate < currentTime) {
      return null
    }
    return endDate
  }
}
