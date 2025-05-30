import type { Mark, MarkId, PersonalMark, UserId } from "@dotkomonline/types"
import { DateFns } from "@dotkomonline/utils"
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
  calculateExpiryDate(marks: { createdAt: Date; duration: number }[]): Date | null
}

export class PersonalMarkServiceImpl implements PersonalMarkService {
  private readonly personalMarkRepository: PersonalMarkRepository
  private readonly markService: MarkService

  constructor(personalMarkRepository: PersonalMarkRepository, markService: MarkService) {
    this.personalMarkRepository = personalMarkRepository
    this.markService = markService
  }

  async getPersonalMarksForUserId(userId: UserId): Promise<PersonalMark[]> {
    const personalMarks = await this.personalMarkRepository.getAllByUserId(userId)
    return personalMarks
  }

  async getMarksForUserId(userId: UserId): Promise<Mark[]> {
    const personalMarks = await this.personalMarkRepository.getAllMarksByUserId(userId)
    return personalMarks
  }

  async getPersonalMarksByMarkId(markId: MarkId): Promise<PersonalMark[]> {
    const personalMarks = await this.personalMarkRepository.getByMarkId(markId)
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
    const personalMarks = await this.personalMarkRepository.getAllByUserId(userId)
    const marks = await Promise.all(personalMarks.map(async (mark) => this.markService.getMark(mark.markId)))
    const expiryDate = this.calculateExpiryDate(marks)
    return expiryDate
  }

  async isUserMarked(userId: UserId): Promise<boolean> {
    return (await this.getExpiryDateForUserId(userId)) !== null
  }

  adjustDateIfStartingInHoliday(date: Date): Date {
    if (
      DateFns.isWithinInterval(date, {
        start: new Date(date.getFullYear(), 5),
        end: new Date(date.getFullYear(), 7, 15),
      })
    ) {
      return DateFns.set(date, { month: 7, date: 15 })
    }
    if (date.getMonth() === 11) {
      return DateFns.set(date, { year: date.getFullYear() + 1, month: 0, date: 15 })
    }
    if (date.getMonth() === 0 && date.getDate() < 15) {
      return DateFns.set(date, { month: 0, date: 15 })
    }
    return date
  }

  adjustDateIfEndingInHoliday(date: Date): Date {
    let additionalDays = 0
    if (
      DateFns.isWithinInterval(date, {
        start: new Date(date.getFullYear(), 5),
        end: new Date(date.getFullYear(), 7, 15),
      })
    ) {
      additionalDays = 75
    } else if (date.getMonth() === 11) {
      additionalDays = 45
    } else if (date.getMonth() === 0 && date.getDate() < 15) {
      additionalDays = 45
    }
    return DateFns.add(date, { days: additionalDays })
  }

  calculateExpiryDate(marks: { createdAt: Date; duration: number }[]): Date | null {
    const currentTime = new Date()
    let endDate: Date | null = null
    marks.sort((a, b) => DateFns.compareAsc(a.createdAt, b.createdAt))

    for (const mark of marks) {
      const date =
        endDate && DateFns.isBefore(mark.createdAt, endDate)
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
