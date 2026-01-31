import type { DBHandle } from "@dotkomonline/grades-db"
import type { CourseRepository } from "./course-repository"
import type { Course } from "./course"

export interface CourseService {
  findMany(handle: DBHandle): Promise<Course[]>
}

export function getCourseService(courseRepository: CourseRepository): CourseService {
  return {
    async findMany(handle) {
      return courseRepository.findMany(handle)
    },
  }
}
