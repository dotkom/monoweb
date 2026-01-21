import type { DBHandle } from "@dotkomonline/grades-db"
import { parseOrReport } from "../../invariant"
import { CourseSchema, type Course } from "./course"

export interface CourseRepository {
  findMany(handle: DBHandle): Promise<Course[]>
}

export function getCourseRepository(): CourseRepository {
  return {
    async findMany(handle) {
      const courses = await handle.course.findMany()

      return parseOrReport(CourseSchema.array(), courses)
    },
  }
}
