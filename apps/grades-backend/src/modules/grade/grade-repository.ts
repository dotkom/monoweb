import type { DBHandle } from "@dotkomonline/grades-db"
import { parseOrReport } from "../../invariant"
import { GradeSchema, type GradeWrite, type Grade } from "./grade-types"
import type { CourseCode } from "../course/course-types"

export interface GradeRepository {
  findMany(handle: DBHandle, courseCode: CourseCode): Promise<Grade[]>
  createMany(handle: DBHandle, data: GradeWrite[]): Promise<Grade[]>
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
    async createMany(handle, data) {
      const grades = await handle.grade.createMany({
        data,
      })

      return parseOrReport(GradeSchema.array(), grades)
    },
  }
}
