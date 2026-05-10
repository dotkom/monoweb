import { type DBHandle, sql } from "@dotkomonline/grades-db"
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
  mapLetterGradeFilterToMinAverageGrade,
} from "./course-types"

export interface CourseRepository {
  findMany(handle: DBHandle, query: CourseFilterQuery, offset: number, limit: number): Promise<Course[]>
  find(handle: DBHandle, code: string): Promise<Course>
  create(handle: DBHandle, data: CourseWrite): Promise<Course>
  update(handle: DBHandle, id: CourseId, data: Partial<CourseWrite>): Promise<Course>
  findManyFaculties(handle: DBHandle): Promise<Faculty[]>
  findManyDepartments(handle: DBHandle): Promise<Department[]>
}

export function getCourseRepository(): CourseRepository {
  return {
    async findMany(handle, query, offset, limit) {
      const sortOrder = query.orderBy ?? "desc"
      const sortBy = query.sortBy ?? []

      const bySearch = query.bySearch?.trim()
      const searchContains = bySearch ? `%${bySearch}%` : undefined

      const bySemester = query.bySemester ?? []
      const byTeachingLanguage = query.byTeachingLanguage ?? []
      const byCampus = query.byCampus ?? []
      const byMinGrade = query.byMinGrade
      const minAverageGrade = byMinGrade != null ? mapLetterGradeFilterToMinAverageGrade(byMinGrade) : null

      const courses = await handle.$queryRawTyped(
        sql.findManyCourses(
          offset,
          limit,
          bySearch || null,
          searchContains ?? null,
          bySemester,
          byTeachingLanguage,
          byCampus,
          minAverageGrade,
          sortOrder,
          sortBy[0] ?? null,
          sortBy[1] ?? null,
          sortBy[2] ?? null
        )
      )

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
