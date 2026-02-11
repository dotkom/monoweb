import type { DBHandle } from "@dotkomonline/grades-db"
import { parseOrReport } from "../../invariant"
import { GradeSchema, type Grade, type CourseCode } from "./grade"

export interface GradeRepository {
  findMany(handle: DBHandle, courseSlug: CourseCode): Promise<Grade[]>
}

export function getGradeRepository(): GradeRepository {
  return {
    async findMany(handle, courseSlug) {
      const grades = await handle.grade.findMany({
        where: {
          course: {
            code: courseSlug,
          },
        },
        orderBy: [{ year: "asc" }, { semester: "asc" }],
      })

      return parseOrReport(GradeSchema.array(), grades)
    },
  }
}
