import type { DBHandle } from "@dotkomonline/grades-db"
import type { GradeRepository } from "./grade-repository"
import type { Grade, GradeId } from "./grade"

export interface GradeService {
  findMany(handle: DBHandle, groupSlug: GradeId): Promise<Grade[]>
}

export function getGradeService(courseRepository: GradeRepository): GradeService {
  return {
    async findMany(handle, gradeSlug) {
      return courseRepository.findMany(handle, gradeSlug)
    },
  }
}
