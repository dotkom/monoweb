import type { DBHandle } from "@dotkomonline/grades-db"
import type { Pageable } from "@dotkomonline/utils"
import type { CourseRepository } from "./course-repository"
import type { Course, CourseFilterQuery, CourseId, CourseWrite, Department, Faculty } from "./course-types"

export interface CourseService {
  findMany(handle: DBHandle, query: CourseFilterQuery, page: Pageable): Promise<Course[]>
  find(handle: DBHandle, code: string): Promise<Course>
  create(handle: DBHandle, data: CourseWrite): Promise<Course>
  update(handle: DBHandle, id: CourseId, data: Partial<CourseWrite>): Promise<Course>
  findManyFaculties(handle: DBHandle): Promise<Faculty[]>
  findManyDepartments(handle: DBHandle): Promise<Department[]>
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

    async findManyFaculties(handle) {
      return courseRepository.findManyFaculties(handle)
    },

    async findManyDepartments(handle) {
      return courseRepository.findManyDepartments(handle)
    },
  }
}
