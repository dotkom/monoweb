import { PrismaClient } from "@dotkom/db"
import { InsertPersonalMarks, mapToPersonalMarks, PersonalMarks } from "./personal-marks"
import { MarkCalculations } from "./mark-calculations"

export interface PersonalMarksRepository {
  getPersonalMarksByID: (id: string) => Promise<PersonalMarks | undefined>
  getAllPersonalMarks: (limit: number) => Promise<PersonalMarks[]>
  createPersonalMarks: (personalMarksInsert: InsertPersonalMarks) => Promise<PersonalMarks>
  addActiveMark: (id: string, mark: string) => Promise<PersonalMarks | undefined>
  getActiveMarksByID: (id: string) => Promise<Array<string> | undefined>
  removeActiveMark: (id: string, mark: string) => Promise<PersonalMarks | undefined>
}

export const initPersonalMarksRepository = (
  client: PrismaClient,
  calculations: MarkCalculations
): PersonalMarksRepository => {
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
      const personalMarks = await repo.getPersonalMarksByID(id)
      if (personalMarks == undefined) {
        return undefined
      }
      const activeMarks = personalMarks.active_marks
      const amountOfMarks = activeMarks.length
      let startDate: Date | null = new Date()
      if (amountOfMarks) {
        startDate = personalMarks.start_date
      }
      const endDate = calculations.calculateEndDate(startDate, amountOfMarks)
      const updatedMarks = client.personalMarks.update({
        where: { id },
        data: { active_marks: [...activeMarks, mark], start_date: startDate, end_date: endDate },
      })
      return updatedMarks
    },
    removeActiveMark: async (id, mark: string) => {
      const personalMarks = await repo.getPersonalMarksByID(id)
      if (personalMarks == undefined) {
        return undefined
      }
      const activeMarks = personalMarks.active_marks
      const index = activeMarks.indexOf(mark)
      console.log(index)
      if (index !== -1) {
        activeMarks.splice(index, 1)
      }
      const amountOfMarks = activeMarks.length
      let startDate = personalMarks.start_date
      if (!amountOfMarks) {
        startDate = null
      }
      const endDate = calculations.calculateEndDate(startDate, amountOfMarks)
      const updatedMarks = client.personalMarks.update({
        where: { id },
        data: { active_marks: [...activeMarks, mark], start_date: startDate, end_date: endDate },
      })
      return updatedMarks
    },
  }
  return repo
}
