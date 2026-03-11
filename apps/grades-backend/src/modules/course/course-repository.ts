import type { DBHandle } from "@dotkomonline/grades-db"
import { parseOrReport } from "../../invariant"
import { CourseSchema, type Course } from "./course"

export interface CourseRepository {
  findMany(handle: DBHandle): Promise<Course[]>
  find(handle: DBHandle, code: string): Promise<Course>
}

export function getCourseRepository(): CourseRepository {
  return {
    async findMany(handle) {
      const courses = await handle.course.findMany()

      return parseOrReport(CourseSchema.array(), courses)
    },
    async find(handle, code) {
      const course = await handle.course.findUnique({ where: { code: code } })

      return parseOrReport(CourseSchema, course)
    },
  }
}
