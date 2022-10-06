import { PrismaClient } from "@dotkom/db"
import { InsertPersonalMarks, mapToPersonalMarks, PersonalMarks } from "./personal-marks"

export interface PersonalMarksRepository {
  getPersonalMarksByID: (id: string) => Promise<PersonalMarks | undefined>
  getAllPersonalMarks: (limit: number) => Promise<PersonalMarks[]>
  createPersonalMarks: (personalMarksInsert: InsertPersonalMarks) => Promise<PersonalMarks>
  addActiveMark: (id: string, mark: string) => Promise<PersonalMarks | undefined>
  getActiveMarksByID: (id: string) => Promise<Array<string> | undefined>
  calculateEndDate: (startDate: Date, amountOfMarks: number) => Date
  calculateStartDate: () => Date
}

export const initPersonalMarksRepository = (client: PrismaClient): PersonalMarksRepository => {
  const markDuration = 20
  const repo: PersonalMarksRepository = {
    getPersonalMarksByID: async (id) => {
      const personalMarks = await client.personalMarks.findUnique({
        where: { id },
      })
      return personalMarks ? mapToPersonalMarks(personalMarks) : undefined
    },
    getAllPersonalMarks: async (limit: number) => {
      const allPersonalMarks = await client.personalMarks.findMany({ take: limit })
      return allPersonalMarks.map(mapToPersonalMarks)
    },
    createPersonalMarks: async (personalMarksInsert) => {
      const personalMarks = await client.personalMarks.create({
        data: {
          ...personalMarksInsert,
        },
      })
      return mapToPersonalMarks(personalMarks)
    },
    getActiveMarksByID: async (id) => {
      const personalMarks = await repo.getPersonalMarksByID(id)
      return personalMarks?.active_marks
    },
    addActiveMark: async (id, mark) => {
      const activeMarks = await repo.getActiveMarksByID(id)
      if (activeMarks == undefined) {
        return undefined
      }
      const personalMarks = client.personalMarks.update({
        where: { id },
        data: { active_marks: [...activeMarks, mark] },
      })
      return personalMarks
    },
    calculateStartDate: () => {
      let startDate = new Date()
      if (startDate.getMonth() == 11) {
        startDate = new Date(startDate.getFullYear() + 1, 0, 15, 1)
      } else if (startDate.getMonth() == 0 && startDate.getDay() < 15) {
        startDate = new Date(startDate.getFullYear(), 0, 15, 1)
      } else if (startDate.getMonth() > 4 && startDate.getMonth() + startDate.getDate() / 100 < 7.15) {
        startDate = new Date(startDate.getFullYear(), 7, 15, 2)
      }
      return startDate
    },
    calculateEndDate: (startDate, amountOfMarks) => {
      const endDate = startDate
      for (let i = 0; i < amountOfMarks; i++) {
        endDate.setDate(endDate.getDate() + markDuration)
        if (endDate.getMonth() == 11 || (endDate.getMonth() == 0 && endDate.getDay() < 15)) {
          endDate.setDate(endDate.getDate() + 45)
        } else if (endDate.getMonth() > 4 && endDate.getMonth() + endDate.getDate() / 100 < 7.15) {
          endDate.setDate(endDate.getDate() + 75)
        }
      }
      return endDate
    },
  }
  return repo
}
