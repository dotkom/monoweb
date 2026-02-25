import type { DBHandle } from "@dotkomonline/grades-db"
import { parseOrReport } from "../../invariant"
import { type Course, type CourseFilterQuery, CourseSchema } from "./course"
import { type Pageable, pageQuery } from "../../query"

export interface CourseRepository {
  findMany(handle: DBHandle, query: CourseFilterQuery, page: Pageable): Promise<Course[]>
  find(handle: DBHandle, code: string): Promise<Course>
}

export function getCourseRepository(): CourseRepository {
  return {
    async findMany(handle, query, page) {
      const orderDirection = query.orderBy ?? "desc"

      const courses = await handle.course.findMany({
        ...pageQuery(page),
        orderBy: {
          passRate: query.sortByPassRate ? orderDirection : undefined,
          averageGrade: query.sortByAverageGrade ? orderDirection : undefined,
          studentCount: query.sortByStudentCount ? orderDirection : undefined,
        },
        where: {
          AND: [
            {
              code:
                query.byCode !== null
                  ? {
                      contains: query.byCode,
                      mode: "insensitive",
                    }
                  : undefined,
            },
            {
              OR: [
                {
                  norwegianName:
                    query.byName !== null
                      ? {
                          contains: query.byName,
                          mode: "insensitive",
                        }
                      : undefined,
                },
                {
                  englishName:
                    query.byName !== null
                      ? {
                          contains: query.byName,
                          mode: "insensitive",
                        }
                      : undefined,
                },
              ],
            },
          ],
        },
      })

      return parseOrReport(CourseSchema.array(), courses)
    },
    async find(handle, code) {
      const course = await handle.course.findUnique({
        where: { code: code },
      })

      return parseOrReport(CourseSchema, course)
    },
  }
}
