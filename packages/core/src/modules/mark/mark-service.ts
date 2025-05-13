import type { Mark, MarkId, MarkWrite, UserId } from "@dotkomonline/types"
import type { Pageable } from "../../query"
import { MarkNotFoundError } from "./mark-error"
import type { MarkRepository } from "./mark-repository"

export interface MarkService {
  getMark(id: MarkId): Promise<Mark>
  getMarks(page: Pageable): Promise<Mark[]>
  createMark(payload: MarkWrite): Promise<Mark>
  updateMark(id: MarkId, payload: MarkWrite): Promise<Mark>
  deleteMark(id: MarkId): Promise<Mark>
  getActiveMarksByUserId(userId: UserId): Promise<Mark[]>
  getActiveMarkSumForUserId(userId: UserId): Promise<number>
  getPostponementMinutesForUserId(userId: UserId): Promise<number>
  getSuspensionEndTimeForUserId(userId: UserId): Promise<Date | null>
  isSuspended(userId: UserId): Promise<boolean>
}

// How long the user has to wait from the registration start of an event until
// they can register.
// Order of the rules is important, as the first rule that matches will be used.
const POSTPONEMENT_RULES = [
  { minMarks: 3, minutes: 60 * 24 },
  { minMarks: 2, minutes: 60 * 4 },
  { minMarks: 1, minutes: 60 },
]

// How long the user is suspended from registering for any event, calculated from
// the start time of the last mark + the minutes in the rule.
const SUSPENSION_RULE = { minMarks: 6, minutes: 60 * 24 * 14 }

export class MarkServiceImpl implements MarkService {
  private readonly markRepository: MarkRepository

  constructor(markRepository: MarkRepository) {
    this.markRepository = markRepository
  }

  /**
   * Get a mark by its id
   *
   * @throws {MarkNotFoundError} if the mark does not exist
   */
  async getMark(id: MarkId): Promise<Mark> {
    const mark = await this.markRepository.getById(id)
    if (!mark) {
      throw new MarkNotFoundError(id)
    }
    return mark
  }

  async getMarks(page: Pageable): Promise<Mark[]> {
    const marks = await this.markRepository.getAll(page)
    return marks
  }

  async createMark(payload: MarkWrite): Promise<Mark> {
    console.log("Creating mark", payload)
    const mark = await this.markRepository.create(payload)
    return mark
  }

  /**
   * Update a mark by its id
   *
   * @throws {MarkNotFoundError} if the mark does not exist
   */
  async updateMark(id: MarkId, payload: MarkWrite): Promise<Mark> {
    const mark = await this.markRepository.update(id, payload)
    if (!mark) {
      throw new MarkNotFoundError(id)
    }
    return mark
  }

  /**
   * Delete a mark by its id
   *
   * @throws {MarkNotFoundError} if the mark does not exist
   */
  async deleteMark(id: MarkId): Promise<Mark> {
    const mark = await this.markRepository.delete(id)
    if (!mark) {
      throw new MarkNotFoundError(id)
    }
    return mark
  }

  async getActiveMarksByUserId(userId: UserId): Promise<Mark[]> {
    return await this.markRepository.getActiveMarksByUserId(userId)
  }

  async getActiveMarkSumForUserId(userId: UserId): Promise<number> {
    const marks = await this.getActiveMarksByUserId(userId)
    return marks.reduce((acc, mark) => acc + mark.amount, 0)
  }

  // How long the user has to wait from the registration start of an event until
  // they can register.
  // Returns -1 if the user is suspended, otherwise returns the number of minutes
  async getPostponementMinutesForUserId(userId: UserId): Promise<number> {
    const marks = await this.getActiveMarksByUserId(userId)
    const markSum = marks.reduce((acc, mark) => acc + mark.amount, 0)

    if (SUSPENSION_RULE.minMarks <= markSum) {
      return -1
    }

    for (const rule of POSTPONEMENT_RULES) {
      if (rule.minMarks <= markSum) {
        return rule.minutes
      }
    }

    return 0
  }

  // How long the user is suspended from registering for any event, calculated from
  // the start time of the last mark + the minutes in the rule.
  // Returns null if the user is not suspended, otherwise returns the date of when
  // the suspension ends.
  async getSuspensionEndTimeForUserId(userId: UserId): Promise<Date | null> {
    const marks = await this.getActiveMarksByUserId(userId)
    const markSum = marks.reduce((acc, mark) => acc + mark.amount, 0)

    if (SUSPENSION_RULE.minMarks > markSum) {
      return null
    }

    const lastMark = marks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).at(0)

    if (!lastMark) {
      return null
    }

    const suspensionEndTime = new Date(lastMark.createdAt.getTime() + SUSPENSION_RULE.minutes * 60 * 1000)
    return suspensionEndTime
  }

  async isSuspended(userId: UserId): Promise<boolean> {
    const suspensionEndTime = await this.getSuspensionEndTimeForUserId(userId)
    return !!suspensionEndTime && suspensionEndTime > new Date()
  }
}
