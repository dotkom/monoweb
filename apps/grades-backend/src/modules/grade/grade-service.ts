import type { DBHandle } from "@dotkomonline/grades-db"
import type { GradeRepository } from "./grade-repository"
import type { Grade } from "./grade"
import type { CourseCode } from "../course/course"

export interface GradeService {
  findMany(handle: DBHandle, courseCode: CourseCode): Promise<Grade[]>
}

export function getGradeService(gradeRepository: GradeRepository): GradeService {
  return {
    async findMany(handle, courseCode) {
      return gradeRepository.findMany(handle, courseCode)
    },
  }
}
