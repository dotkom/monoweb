import type { DBHandle } from "@dotkomonline/grades-db"
import { parseOrReport } from "../../invariant"
import { GradeSchema, type Grade } from "./grade"
import type { CourseCode } from "../course/course"

export interface GradeRepository {
  findMany(handle: DBHandle, courseCode: CourseCode): Promise<Grade[]>
}

export function getGradeRepository(): GradeRepository {
  return {
    async findMany(handle, courseCode) {
      const grades = await handle.grade.findMany({
        where: {
          course: {
            code: courseCode,
          },
        },
        orderBy: [{ year: "asc" }, { semester: "asc" }],
      })

      return parseOrReport(GradeSchema.array(), grades)
    },
  }
}
