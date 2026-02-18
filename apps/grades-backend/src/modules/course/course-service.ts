import type { DBHandle } from "@dotkomonline/grades-db"
import type { CourseRepository } from "./course-repository"
import type { Course } from "./course"

export interface CourseService {
  findMany(handle: DBHandle): Promise<Course[]>
  find(handle: DBHandle, code: string): Promise<Course>
}

export function getCourseService(courseRepository: CourseRepository): CourseService {
  return {
    async findMany(handle) {
      return courseRepository.findMany(handle)
    },
    async find(handle, code) {
      return courseRepository.find(handle, code)
    },
  }
}
