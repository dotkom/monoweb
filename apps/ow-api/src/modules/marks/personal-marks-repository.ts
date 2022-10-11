import { PrismaClient } from "@dotkom/db"
import { InsertPersonalMarks, mapToPersonalMarks, PersonalMarks } from "./personal-marks"
import { MarkCalculations } from "./mark-calculations"

export interface PersonalMarksRepository {
  getPersonalMarksByID: (id: string) => Promise<PersonalMarks | undefined>
  getAllPersonalMarks: (limit: number) => Promise<PersonalMarks[]>
  createPersonalMarks: (personalMarksInsert: InsertPersonalMarks) => Promise<PersonalMarks>
  addActiveMark: (id: string, mark: string) => Promise<PersonalMarks | undefined>
  removeActiveMark: (id: string, mark: string) => Promise<PersonalMarks | undefined>
  checkExpiredMarksByID: (id: string) => Promise<PersonalMarks | undefined>
  userIsCurrentlyMarked: (id: string) => Promise<boolean | undefined>
}

export const initPersonalMarksRepository = (
  client: PrismaClient,
  calculations: MarkCalculations
): PersonalMarksRepository => {
  const repo: PersonalMarksRepository = {
    /**
     * Returns the personal mark data for a user
     *
     * @param id - id of the user
     * @returns Personal mark data for the user
     */
    getPersonalMarksByID: async (id) => {
      const personalMarks = await client.personalMarks.findUnique({
        where: { id },
      })
      return personalMarks ? mapToPersonalMarks(personalMarks) : undefined
    },
    /**
     * Gets a list of all personal marks objects
     *
     * @param limit - How many values to return maximum
     * @returns All the personal marks within the limit
     */
    getAllPersonalMarks: async (limit: number) => {
      const allPersonalMarks = await client.personalMarks.findMany({ take: limit })
      return allPersonalMarks.map(mapToPersonalMarks)
    },
    /**
     * Adds all the info about personal marks to a user
     *
     * @param personalMarkInsert - The data to initialize the personal marks with
     * @returns An updated personalMarks object for the user
     */
    createPersonalMarks: async (personalMarksInsert) => {
      const personalMarks = await client.personalMarks.create({
        data: {
          ...personalMarksInsert,
        },
      })
      return mapToPersonalMarks(personalMarks)
    },
    /**
     * Adds a mark to a users active marks and recalculates the start and end dates
     *
     * @param id - ID of the user to check
     * @param mark - The mark to be added
     * @returns An updated personalMarks object for the user
     */
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
      const updatedMarks = await client.personalMarks.update({
        where: { id },
        data: { active_marks: [...activeMarks, mark], start_date: startDate, end_date: endDate },
      })
      return updatedMarks
    },
    /**
     * Removes a mark from a users active marks and recalculates the start and end dates
     *
     * @param id - ID of the user to check
     * @param mark - The mark to be removed
     * @returns An updated personalMarks object for the user
     */
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
      const updatedMarks = await client.personalMarks.update({
        where: { id },
        data: { active_marks: [...activeMarks, mark], start_date: startDate, end_date: endDate },
      })
      return updatedMarks
    },
    /**
     * Checks if the end date for active marks has passed.
     * Moves all marks to mark history and nullifies start- and end-date if the marks are expired.
     *
     * @param id - ID of the user to check
     * @returns An updated personalMarks object for the user
     */
    checkExpiredMarksByID: async (id) => {
      const personalMarks = await repo.getPersonalMarksByID(id)
      if (personalMarks == undefined) {
        return undefined
      }
      const currentDate = new Date()
      if (personalMarks.end_date && personalMarks.end_date < currentDate) {
        const updatedMarks = await client.personalMarks.update({
          where: { id },
          data: {
            active_marks: [],
            start_date: null,
            end_date: null,
            mark_history: [...personalMarks.mark_history, ...personalMarks.active_marks],
          },
        })
        return updatedMarks
      }
    },
    /**
     * Calls all the logic needed to check for and update expired marks.
     * Returns whether or not a user is currently marked
     *
     * @param id - ID of the user to check
     * @returns A boolean value or undefined if the user couldn't be found
     */
    userIsCurrentlyMarked: async (id) => {
      const personalMarks = await repo.checkExpiredMarksByID(id)
      return personalMarks ? (personalMarks.end_date ? true : false) : undefined
    },
  }
  return repo
}
