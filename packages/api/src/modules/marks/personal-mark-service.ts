import { NotFoundError } from "../../errors/errors"
import { PersonalMarkRepository } from "./personal-mark-repository"
import { MarkService } from "./mark-service"
import { Mark, PersonalMark } from "@dotkomonline/types"
import { add, compareAsc, isBefore, isWithinInterval, set } from "date-fns"

export interface PersonalMarkService {
  getPersonalMarksForUser: (userId: string) => Promise<PersonalMark[]>
  addPersonalMarkToUser: (userId: string, markId: string) => Promise<PersonalMark>
  removePersonalMark: (userId: string, markId: string) => Promise<PersonalMark>
  getAllMarksForUser: (userId: string) => Promise<Mark[]>
  getExpiryDateForUser: (userId: string) => Promise<Date | null>
  calculateExpiryDate: (marks: { givenAt: Date; duration: number }[]) => Date | null
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
      const mark = await markService.getMark(markId)
      if (!mark) throw new NotFoundError(`Mark with ID:${markId} not found`)
      const personalMark = await personalMarkRepository.addPersonalMarkToUser(userId, markId)
      if (!personalMark) throw new NotFoundError(`PersonalMark could not be created`)
      return personalMark
    },
    removePersonalMark: async (userId: string, markId: string) => {
      const personalMark = await personalMarkRepository.removePersonalMark(userId, markId)
      if (!personalMark) throw new NotFoundError(`PersonalMark could not be removed`)
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
      const expiryDate = service.calculateExpiryDate(marks)
      return expiryDate
    },
    isUserMarked: async (userId: string) => {
      return service.getExpiryDateForUser(userId) !== null
    },
    adjustDateIfStartingInHoliday: (date: Date) => {
      if (
        isWithinInterval(date, { start: new Date(date.getFullYear(), 5), end: new Date(date.getFullYear(), 7, 15) })
      ) {
        date = set(date, { month: 7, date: 15 })
      } else if (date.getMonth() == 11) {
        date = set(date, { year: date.getFullYear() + 1, month: 0, date: 15 })
      } else if (date.getMonth() == 0 && date.getDate() < 15) {
        date = set(date, { month: 0, date: 15 })
      }
      return date
    },
    adjustDateIfEndingInHoliday: (date: Date) => {
      let additionalDays = 0
      if (
        isWithinInterval(date, { start: new Date(date.getFullYear(), 5), end: new Date(date.getFullYear(), 7, 15) })
      ) {
        additionalDays = 75
      } else if (date.getMonth() == 11) {
        additionalDays = 45
      } else if (date.getMonth() == 0 && date.getDate() < 15) {
        additionalDays = 45
      }
      return add(date, { days: additionalDays })
    },
    calculateExpiryDate: (marks: { givenAt: Date; duration: number }[]) => {
      const currentTime = new Date()
      let endDate: Date | null = null
      const orderedMarks = marks.sort((a, b) => compareAsc(a.givenAt, b.givenAt))

      for (const mark of orderedMarks) {
        const date =
          endDate && isBefore(mark.givenAt, endDate)
            ? new Date(service.adjustDateIfStartingInHoliday(endDate).getTime())
            : new Date(service.adjustDateIfStartingInHoliday(mark.givenAt).getTime())
        date.setDate(date.getDate() + mark.duration)

        endDate = service.adjustDateIfEndingInHoliday(date)
      }

      if (!endDate || endDate < currentTime) return null
      return endDate
    },
  }
  return service
}
