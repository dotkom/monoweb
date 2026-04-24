import type { DBHandle } from "@dotkomonline/grades-db"
import type { CourseCode } from "../course/course-types"
import type { GradeRepository } from "./grade-repository"
import type { Grade, GradeWrite } from "./grade-types"

export interface GradeService {
  findMany(handle: DBHandle, courseCode?: CourseCode): Promise<Grade[]>
  createMany(handle: DBHandle, data: GradeWrite[]): Promise<Grade[]>
}

export function getGradeService(gradeRepository: GradeRepository): GradeService {
  return {
    async findMany(handle, courseCode) {
      return gradeRepository.findMany(handle, courseCode)
    },
    async createMany(handle, data) {
      return gradeRepository.createMany(handle, data)
    },
  }
}
