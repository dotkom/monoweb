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
  calculateExpiryDate: (marks: Mark[]) => Date | null
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
      if (!marks) throw new NotFoundError(`Marks for user with ID:${userId} not found`)
      const expiryDate = service.calculateExpiryDate(marks)
      return expiryDate
    },
    isUserMarked: async (userId: string) => {
      const marks = await service.getExpiryDateForUser(userId)
      if (!marks) throw new NotFoundError(`Marks for user with ID:${userId} not found`)
      return marks != null
    },
    adjustDateCalculationForHolidays: (date: Date) => {
      let additionalDays = 0
      if (
        isWithinInterval(date, { start: new Date(date.getFullYear(), 5), end: new Date(date.getFullYear(), 7, 15) })
      ) {
        date = set(date, { month: 7, date: 15 })
        additionalDays = 75
      } else if (date.getMonth() == 11) {
        date = new Date(date.getFullYear() + 1, 0, 15)
        additionalDays = 45
      } else if (date.getMonth() == 0 && date.getDate() < 15) {
        date = new Date(date.getFullYear(), 0, 15)
        additionalDays = 45
      }
      return { date: date, additionalDays: additionalDays }
    },
    calculateExpiryDate: (marks: Mark[]) => {
      const currentTime = new Date()
      let endDate: Date | null = null
      const orderedMarks = marks.sort((a, b) => compareAsc(a.givenAt, b.givenAt))
      orderedMarks.forEach((mark) => {
        const date =
          endDate && isBefore(mark.givenAt, endDate)
            ? new Date(service.adjustDateCalculationForHolidays(endDate).date.getTime())
            : new Date(service.adjustDateCalculationForHolidays(mark.givenAt).date.getTime())
        date.setDate(date.getDate() + mark.duration)

        const adjustedEnd = service.adjustDateCalculationForHolidays(date)
        const adjustedEndDate = add(date, { days: adjustedEnd.additionalDays })

        endDate = adjustedEndDate
      })
      if (endDate != null && endDate > currentTime) {
        return endDate
      }
      return null
    },
  }
  return service
}
