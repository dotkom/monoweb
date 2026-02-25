import type { DBHandle } from "@dotkomonline/grades-db"
import { parseOrReport } from "../../invariant"
import { CourseSchema, type Course, type CourseFilterQuery } from "./course"
import { pageQuery, type Pageable } from "src/query"

export interface CourseRepository {
  findMany(handle: DBHandle, query: CourseFilterQuery, page: Pageable): Promise<Course[]>
  find(handle: DBHandle, code: string): Promise<Course>
}

export function getCourseRepository(): CourseRepository {
  return {
    async findMany(handle, query, page) {
      const courses = await handle.course.findMany({
          ...pageQuery(page),
          where: {
            AND: [
              {
                code: 
                  query.byCode !== null ?
                  {
                    contains: query.byCode,
                    mode: "insensitive"
                  }
                  : undefined
              },
              {
                OR: [
                  {
                    norwegianName:
                      query.byName !== null ?
                      {
                        contains: query.byName,
                        mode: "insensitive"
                      }
                      : undefined
                  },
                  {
                    englishName:
                      query.byName !== null ?
                      {
                        contains: query.byName,
                        mode: "insensitive"
                      }
                      : undefined
                  }
                ]
              }
            ]
          }
        })

      return parseOrReport(CourseSchema.array(), courses)
    },
    async find(handle, code) {
      const course = await handle.course.findUnique({ where: { code: code } })

      return parseOrReport(CourseSchema, course)
    },
  }
}
