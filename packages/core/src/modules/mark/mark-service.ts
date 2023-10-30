import { Mark, MarkId, PersonalMark, MarkWrite, UserId } from "@dotkomonline/types"
import { add, compareAsc, isBefore, isWithinInterval, set } from "date-fns"
import { NotFoundError } from "../../errors/errors"
import { Cursor } from "../../utils/db-utils"
import { MarkRepository } from "./mark-repository"
import { PersonalMarkRepository } from "./personal-mark-repository"

export interface MarkService {
  getMark(id: MarkId): Promise<Mark>
  getMarks(limit: number, cursor?: Cursor): Promise<Mark[]>
  createMark(payload: MarkWrite): Promise<Mark>
  updateMark(id: MarkId, payload: MarkWrite): Promise<Mark>
  deleteMark(id: MarkId): Promise<Mark>
  getPersonalMarksByMarkId(markId: MarkId, take: number, cursor?: Cursor): Promise<PersonalMark[]>
  getPersonalMarksForUserId(userId: UserId, take: number, cursor?: Cursor): Promise<PersonalMark[]>
  getMarksForUserId(userId: UserId, take: number, cursor?: Cursor): Promise<Mark[]>
  addPersonalMarkToUserId(userId: UserId, markId: MarkId): Promise<PersonalMark>
  removePersonalMarkFromUserId(userId: UserId, markId: MarkId): Promise<PersonalMark>
  countUsersByMarkId(markId: MarkId): Promise<number>
  getExpiryDateForUserId(userId: UserId): Promise<Date | null>
  calculateExpiryDate(marks: { createdAt: Date; duration: number }[]): Date | null
}

export class MarkServiceImpl implements MarkService {
  constructor(
    private readonly markRepository: MarkRepository,
    private readonly personalMarkRepository: PersonalMarkRepository
  ) {}

  async getPersonalMarksForUserId(userId: UserId, take: number, cursor?: Cursor): Promise<PersonalMark[]> {
    const personalMarks = await this.personalMarkRepository.getAllByUserId(userId, take, cursor)
    return personalMarks
  }

  async getMarksForUserId(userId: UserId, take: number, cursor?: Cursor): Promise<Mark[]> {
    const personalMarks = await this.personalMarkRepository.getAllMarksByUserId(userId, take, cursor)
    return personalMarks
  }

  async getPersonalMarksByMarkId(markId: MarkId): Promise<PersonalMark[]> {
    const personalMarks = await this.personalMarkRepository.getByMarkId(markId)
    return personalMarks
  }

  async addPersonalMarkToUserId(userId: UserId, markId: MarkId): Promise<PersonalMark> {
    const mark = await this.getMark(markId)
    if (!mark) throw new NotFoundError(`Mark with ID:${markId} not found`)
    const personalMark = await this.personalMarkRepository.addToUserId(userId, markId)
    if (!personalMark) throw new NotFoundError(`PersonalMark could not be created`)
    return personalMark
  }

  async removePersonalMarkFromUserId(userId: UserId, markId: MarkId): Promise<PersonalMark> {
    const personalMark = await this.personalMarkRepository.removeFromUserId(userId, markId)
    if (!personalMark) throw new NotFoundError(`PersonalMark could not be removed`)
    return personalMark
  }

  async countUsersByMarkId(markId: MarkId): Promise<number> {
    const count = await this.personalMarkRepository.countUsersByMarkId(markId)
    return count
  }

  async getExpiryDateForUserId(userId: UserId): Promise<Date | null> {
    const personalMarks = await this.personalMarkRepository.getAllByUserId(userId, 1000)
    const marks = await Promise.all(personalMarks.map((mark) => this.getMark(mark.markId)))
    const expiryDate = this.calculateExpiryDate(marks)
    return expiryDate
  }

  async isUserMarked(userId: UserId): Promise<boolean> {
    return (await this.getExpiryDateForUserId(userId)) !== null
  }

  adjustDateIfStartingInHoliday(date: Date): Date {
    if (isWithinInterval(date, { start: new Date(date.getFullYear(), 5), end: new Date(date.getFullYear(), 7, 15) })) {
      date = set(date, { month: 7, date: 15 })
    } else if (date.getMonth() == 11) {
      date = set(date, { year: date.getFullYear() + 1, month: 0, date: 15 })
    } else if (date.getMonth() == 0 && date.getDate() < 15) {
      date = set(date, { month: 0, date: 15 })
    }
    return date
  }

  adjustDateIfEndingInHoliday(date: Date): Date {
    let additionalDays = 0
    if (isWithinInterval(date, { start: new Date(date.getFullYear(), 5), end: new Date(date.getFullYear(), 7, 15) })) {
      additionalDays = 75
    } else if (date.getMonth() == 11) {
      additionalDays = 45
    } else if (date.getMonth() == 0 && date.getDate() < 15) {
      additionalDays = 45
    }
    return add(date, { days: additionalDays })
  }

  calculateExpiryDate(marks: { createdAt: Date; duration: number }[]): Date | null {
    const currentTime = new Date()
    let endDate: Date | null = null
    const orderedMarks = marks.sort((a, b) => compareAsc(a.createdAt, b.createdAt))

    for (const mark of orderedMarks) {
      const date =
        endDate && isBefore(mark.createdAt, endDate)
          ? new Date(this.adjustDateIfStartingInHoliday(endDate).getTime())
          : new Date(this.adjustDateIfStartingInHoliday(mark.createdAt).getTime())
      date.setDate(date.getDate() + mark.duration)

      endDate = this.adjustDateIfEndingInHoliday(date)
    }

    if (!endDate || endDate < currentTime) return null
    return endDate
  }

  async getMark(id: MarkId): Promise<Mark> {
    const mark = await this.markRepository.getById(id)
    if (!mark) throw new NotFoundError(`Mark with ID:${id} not found`)
    return mark
  }

  async getMarks(limit: number, cursor?: Cursor): Promise<Mark[]> {
    const marks = await this.markRepository.getAll(limit, cursor)
    return marks
  }

  async createMark(payload: MarkWrite): Promise<Mark> {
    const mark = await this.markRepository.create(payload)
    if (!mark) throw new NotFoundError(`Mark could not be created`)
    return mark
  }

  async updateMark(id: MarkId, payload: MarkWrite): Promise<Mark> {
    const mark = await this.markRepository.update(id, payload)
    if (!mark) throw new NotFoundError(`Mark with ID:${id} not found`)
    return mark
  }

  async deleteMark(id: MarkId): Promise<Mark> {
    const mark = await this.markRepository.delete(id)
    if (!mark) throw new NotFoundError(`Mark with ID:${id} not found`)
    return mark
  }
}
