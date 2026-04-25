import type { DBHandle } from "@dotkomonline/grades-db"
import { type Pageable, pageQuery } from "@dotkomonline/utils"
import { parseOrReport } from "../../invariant"
import {
  type Course,
  type CourseFilterQuery,
  type CourseId,
  CourseSchema,
  type CourseWrite,
  type Department,
  DepartmentSchema,
  type Faculty,
  FacultySchema,
} from "./course-types"

export interface CourseRepository {
  findMany(handle: DBHandle, query: CourseFilterQuery, page: Pageable): Promise<Course[]>
  find(handle: DBHandle, code: string): Promise<Course>
  create(handle: DBHandle, data: CourseWrite): Promise<Course>
  update(handle: DBHandle, id: CourseId, data: Partial<CourseWrite>): Promise<Course>
  findManyFaculties(handle: DBHandle): Promise<Faculty[]>
  findManyDepartments(handle: DBHandle): Promise<Department[]>
}

export function getCourseRepository(): CourseRepository {
  return {
    async findMany(handle, query, page) {
      const sortFieldMap = {
        AVERAGE_GRADE: "averageGrade",
        PASS_RATE: "passRate",
        CANDIDATE_COUNT: "candidateCount",
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
                  nameNo:
                    query.byName !== null
                      ? {
                          contains: query.byName,
                          mode: "insensitive",
                        }
                      : undefined,
                },
                {
                  nameEn:
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

    async findManyFaculties(handle) {
      const faculties = await handle.faculty.findMany()

      return parseOrReport(FacultySchema.array(), faculties)
    },

    async findManyDepartments(handle) {
      const departments = await handle.department.findMany()

      return parseOrReport(DepartmentSchema.array(), departments)
    },
  }
}
