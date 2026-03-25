import type { DBHandle } from "@dotkomonline/grades-db"
import { parseOrReport } from "../../invariant"
import { type Course, type CourseFilterQuery, type CourseId, CourseSchema, type CourseWrite } from "./course-types"
import { type Pageable, pageQuery } from "@dotkomonline/utils"

export interface CourseRepository {
  findMany(handle: DBHandle, query: CourseFilterQuery, page: Pageable): Promise<Course[]>
  find(handle: DBHandle, code: string): Promise<Course>
  create(handle: DBHandle, data: CourseWrite): Promise<Course>
  update(handle: DBHandle, id: CourseId, data: Partial<CourseWrite>): Promise<Course>
}

export function getCourseRepository(): CourseRepository {
  return {
    async findMany(handle, query, page) {
      const sortFieldMap = {
        AVERAGE_GRADE: "averageGrade",
        PASS_RATE: "passRate",
        STUDENT_COUNT: "studentCount",
      } as const

      const sortOrder = query.orderBy ?? "desc"
      const sortBy = query.sortBy ?? []
      const orderBy =
        sortBy.length > 0
          ? sortBy.map((sortKey) => ({
              [sortFieldMap[sortKey]]: sortOrder,
            }))
          : []

      const courses = await handle.course.findMany({
        ...pageQuery(page),
        orderBy,
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

    async create(handle, data) {
      const course = await handle.course.create({
        data,
      })

      return parseOrReport(CourseSchema, course)
    },

    async update(handle, id, data) {
      const course = await handle.course.update({
        where: { id },
        data,
      })

      return parseOrReport(CourseSchema, course)
    },
  }
}
