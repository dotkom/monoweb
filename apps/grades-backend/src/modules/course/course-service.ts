import type { DBHandle } from "@dotkomonline/grades-db"
import type { CourseRepository } from "./course-repository"
import type { Course, CourseFilterQuery, CourseId, CourseWrite } from "./course-types"
import type { Pageable } from "@dotkomonline/utils"

export interface CourseService {
  findMany(handle: DBHandle, query: CourseFilterQuery, page: Pageable): Promise<Course[]>
  find(handle: DBHandle, code: string): Promise<Course>
  create(handle: DBHandle, data: CourseWrite): Promise<Course>
  update(handle: DBHandle, id: CourseId, data: Partial<CourseWrite>): Promise<Course>
}

export function getCourseService(courseRepository: CourseRepository): CourseService {
  return {
    async findMany(handle, query, page) {
      return courseRepository.findMany(handle, query, page)
    },
    async find(handle, code) {
      return courseRepository.find(handle, code)
    },
    async create(handle, data) {
      return courseRepository.create(handle, data)
    },
    async update(handle, id, data) {
      return courseRepository.update(handle, id, data)
    },
  }
}
