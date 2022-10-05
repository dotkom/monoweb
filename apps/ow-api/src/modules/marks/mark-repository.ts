import { PrismaClient } from "@dotkom/db"
import { InsertMark, mapToMark, Mark } from "./mark"

export interface MarkRepository {
  getMarkByID: (id: string) => Promise<Mark | undefined>
  getMarks: (limit: number) => Promise<Mark[]>
  createMark: (markInsert: InsertMark) => Promise<Mark>
}

export const initMarkRepository = (client: PrismaClient): MarkRepository => {
  const repo: MarkRepository = {
    getMarkByID: async (id) => {
      const mark = await client.mark.findUnique({
        where: { id },
      })
      return mark ? mapToMark(mark) : undefined
    },
    getMarks: async (limit: number) => {
      const marks = await client.mark.findMany({ take: limit })
      return marks.map(mapToMark)
    },
    createMark: async (markInsert) => {
      const mark = await client.mark.create({
        data: {
          ...markInsert,
        },
      })
      return mapToMark(mark)
    },
  }
  return repo
}
