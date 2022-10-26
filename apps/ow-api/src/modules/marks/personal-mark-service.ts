import { NotFoundError } from "../../errors/errors"
import { PersonalMark } from "./personal-mark"
import { PersonalMarkRepository } from "./personal-mark-repository"
import { MarkService } from "./mark-service"
import { Mark } from "./mark"

export interface PersonalMarkService {
  getPersonalMarksForUser: (userId: string) => Promise<PersonalMark[]>
  addPersonalMarkToUser: (userId: string, markId: string) => Promise<PersonalMark>
  removePersonalMark: (userId: string, markId: string) => Promise<PersonalMark>
  getAllMarksForUser: (userId: string) => Promise<Mark[]>
  getExpiryDateForUser: (userId: string) => Promise<Date | null>
}

export const initPersonalMarkService = (
  personalMarkRepository: PersonalMarkRepository,
  markService: MarkService
): PersonalMarkService => {
  const service = {
    getPersonalMarksForUser: async (userId: string) => {
      const personalMarks = await personalMarkRepository.getPersonalMarksForUser(userId)
      if (!personalMarks) throw new NotFoundError(`PersonalMarks for user with ID:${userId} not found`)
      return personalMarks
    },
    addPersonalMarkToUser: async (userId: string, markId: string) => {
      const mark = markService.getMark(markId)
      if (!mark) throw new NotFoundError(`Mark with ID:${markId} not found`)
      const personalMark = await personalMarkRepository.addPersonalMarkToUser(userId, markId)
      return personalMark
    },
    removePersonalMark: async (userId: string, markId: string) => {
      const personalMark = await personalMarkRepository.removePersonalMark(userId, markId)
      return personalMark
    },
    getAllMarksForUser: async (userId: string) => {
      const personalMarks = await personalMarkRepository.getPersonalMarksForUser(userId)
      if (!personalMarks) throw new NotFoundError(`Marks for user with ID:${userId} not found`)
      const marks = await Promise.all(personalMarks.map((mark) => markService.getMark(mark.markId)))
      return marks
    },
    getExpiryDateForUser: async (userId: string) => {
      const marks = await service.getAllMarksForUser(userId)
      return getExpiryDate(marks)
    },
    isUserMarked: async (userId: string) => {
      const marks = await service.getExpiryDateForUser(userId)
      return marks != null
    },
  }
  return service
}

const adjustDateForHolidays = (date: Date) => {
  let additionalDays = 0
  if (date.getMonth() > 4 && date.getMonth() + date.getDate() / 100 < 7.15) {
    date = new Date(date.getFullYear(), 7, 15)
    additionalDays = 75
  } else if (date.getMonth() == 11) {
    date = new Date(date.getFullYear() + 1, 0, 15)
    additionalDays = 45
  } else if (date.getMonth() == 0 && date.getDate() < 15) {
    date = new Date(date.getFullYear(), 0, 15)
    additionalDays = 45
  }
  return { date: date, additionalDays: additionalDays }
}
const getExpiryDate = (marks: Mark[]) => {
  const currentTime = new Date()
  let endDate: Date | null = null
  const orderedMarks = marks.sort((a, b) => a.given_at.getTime() - b.given_at.getTime())
  orderedMarks.forEach((mark) => {
    const date =
      endDate && mark.given_at.getTime() < endDate.getTime()
        ? new Date(adjustDateForHolidays(endDate).date.getTime())
        : new Date(adjustDateForHolidays(mark.given_at).date.getTime())
    date.setDate(date.getDate() + mark.duration)

    const adjustedEnd = adjustDateForHolidays(date)
    const adjustedEndDate = new Date(adjustedEnd.date.getTime() + adjustedEnd.additionalDays * 24 * 60 * 60 * 1000)

    endDate = adjustedEndDate
  })
  if (endDate != null && endDate > currentTime) {
    return endDate
  }
  return null
}
