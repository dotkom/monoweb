import type { DBHandle } from "@dotkomonline/grades-db"
import { parseOrReport } from "../../invariant"
import { GradeSchema, type Grade, type GradeId } from "./grade"

export interface GradeRepository {
  findMany(handle: DBHandle, courseSlug: GradeId): Promise<Grade[]>
}

export function getGradeRepository(): GradeRepository {
  return {
    async findMany(handle, courseSlug) {
      const grades = await handle.grade.findMany({ where: { courseId: courseSlug } })

      return parseOrReport(GradeSchema.array(), grades)
    },
  }
}