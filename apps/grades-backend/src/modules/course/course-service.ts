import type { DBHandle } from "@dotkomonline/grades-db"
import type { CourseRepository } from "./course-repository"
import type { Course, CourseFilterQuery } from "./course"
import type { Pageable } from "src/query"

export interface CourseService {
  findMany(handle: DBHandle, query: CourseFilterQuery, page: Pageable): Promise<Course[]>
  find(handle: DBHandle, code: string): Promise<Course>
}

export function getCourseService(courseRepository: CourseRepository): CourseService {
  return {
    async findMany(handle, query, page) {
      return courseRepository.findMany(handle, query, page)
    },
    async find(handle, code) {
      return courseRepository.find(handle, code)
    },
  }
}
