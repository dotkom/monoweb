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
const inSummerHoliday = (date: Date) => {
  return date.getMonth() == 11 || (date.getMonth() == 0 && date.getDay() < 15)
}

const inWinterHoliday = (date: Date) => {
  return date.getMonth() > 4 && date.getMonth() + date.getDate() / 100 < 7.15
}

const calculateEndDate = (startDate: Date, duration: number) => {
  let date: Date
  if (inSummerHoliday(startDate)) {
    date = new Date(startDate.getFullYear(), 7, 15, 2)
  } else if (inWinterHoliday(startDate)) {
    date = new Date(startDate.getFullYear() + 1, 0, 15, 2)
  } else {
    date = startDate
  }
  const endDate: Date = new Date()
  endDate.setDate(startDate.getDate() + duration)
  if (inSummerHoliday(endDate)) {
    endDate.setDate(endDate.getDate() + 45)
  } else if (inWinterHoliday(endDate)) {
    endDate.setDate(endDate.getDate() + 75)
  }
  return date
}
const getExpiryDate = (marks: Mark[]) => {
  const currentTime = new Date()
  let endDate: Date | null = null

  marks.forEach((mark) => {
    const markEndDate = calculateEndDate(mark.given_at, mark.duration)
    if (endDate == null) {
      endDate = markEndDate
    } else {
      if (markEndDate > endDate) {
        endDate.setDate(endDate.getDate() + mark.duration)
      }
    }
  })
  if (endDate != null && endDate > currentTime) {
    return endDate
  }
  return endDate
}
