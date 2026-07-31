import type { DBHandle } from "@dotkomonline/grades-db"
import type { CourseCode } from "../course/course-types"
import type { GradeDistributionRepository } from "./grade-distribution-repository"
import type { GradeDistribution, GradeDistributionWrite } from "./grade-distribution-types"

export interface GradeDistributionService {
  findMany(handle: DBHandle, courseCode?: CourseCode): Promise<GradeDistribution[]>
  createMany(handle: DBHandle, data: GradeDistributionWrite[]): Promise<GradeDistribution[]>
}

export function getGradeDistributionService(
  gradeDistributionRepository: GradeDistributionRepository
): GradeDistributionService {
  return {
    async findMany(handle, courseCode) {
      return gradeDistributionRepository.findMany(handle, courseCode)
    },
    async createMany(handle, data) {
      return gradeDistributionRepository.createMany(handle, data)
    },
  }
}
