import type { DBHandle } from "@dotkomonline/grades-db"
import { parseOrReport } from "../../invariant"
import {
  GradeDistributionSchema,
  type GradeDistributionWrite,
  type GradeDistribution,
} from "./grade-distribution-types"
import type { CourseCode } from "../course/course-types"

export interface GradeDistributionRepository {
  findMany(handle: DBHandle, courseCode?: CourseCode): Promise<GradeDistribution[]>
  createMany(handle: DBHandle, data: GradeDistributionWrite[]): Promise<GradeDistribution[]>
}

export function getGradeDistributionRepository(): GradeDistributionRepository {
  return {
    async findMany(handle, courseCode) {
      const gradeDistributions = await handle.gradeDistribution.findMany({
        where: {
          course: {
            code: courseCode?.toUpperCase(),
          },
        },
        orderBy: [{ year: "asc" }, { semester: "asc" }],
      })

      return parseOrReport(GradeDistributionSchema.array(), gradeDistributions)
    },
    async createMany(handle, data) {
      const gradeDistributions = await handle.gradeDistribution.createManyAndReturn({
        data,
      })

      return parseOrReport(GradeDistributionSchema.array(), gradeDistributions)
    },
  }
}
