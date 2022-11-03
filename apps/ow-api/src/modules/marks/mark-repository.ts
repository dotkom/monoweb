import { PrismaClient } from "@dotkomonline/db"

import { InsertMark, mapToMark, Mark } from "./mark"

export interface MarkRepository {
  getMarkByID: (id: string) => Promise<Mark | undefined>
  getMarks: (limit: number) => Promise<Mark[]>
  createMark: (markInsert: InsertMark) => Promise<Mark>
  updateMark: (id: string, markUpdate: InsertMark) => Promise<Mark>
  deleteMark: (id: string) => Promise<Mark | undefined>
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
      const marks = await client.mark.findMany({ take: limit, orderBy: { given_at: "desc" } })
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
    updateMark: async (id, markUpdate) => {
      const mark = await client.mark.update({
        where: { id },
        data: {
          ...markUpdate,
        },
      })
      return mapToMark(mark)
    },
    deleteMark: async (id) => {
      const mark = await client.mark.delete({
        where: { id },
      })
      return mapToMark(mark)
    },
  }
  return repo
}
