import { type DBHandle, sql } from "@dotkomonline/grades-db"
import { parseOrReport } from "../../invariant"
import {
  type Course,
  type CourseFilterQuery,
  type CourseId,
  CourseSchema,
  type CourseSitemapEntry,
  CourseSitemapEntrySchema,
  type CourseWrite,
  type Department,
  DepartmentSchema,
  type Faculty,
  FacultySchema,
  mapLetterGradeFilterToMinAverageGrade,
} from "./course-types"

export interface CourseRepository {
  findMany(
    handle: DBHandle,
    query: CourseFilterQuery,
    offset: number,
    limit: number
  ): Promise<{ courses: Course[]; totalCount: number }>
  find(handle: DBHandle, code: string): Promise<Course | null>
  create(handle: DBHandle, data: CourseWrite): Promise<Course>
  update(handle: DBHandle, id: CourseId, data: Partial<CourseWrite>): Promise<Course>
  findManyFaculties(handle: DBHandle): Promise<Faculty[]>
  findManyDepartments(handle: DBHandle): Promise<Department[]>
  findManySitemapEntries(handle: DBHandle): Promise<CourseSitemapEntry[]>
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

      const rows = await handle.$queryRawTyped(
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

      const totalCount = rows[0]?.totalCount ?? 0
      const courses = parseOrReport(CourseSchema.array(), rows)

      return { courses, totalCount }
    },

    async find(handle, code) {
      const course = await handle.course.findUnique({
        where: { code: code.toUpperCase() },
      })

      return parseOrReport(CourseSchema.nullable(), course)
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

    async findManySitemapEntries(handle) {
      const courses = await handle.course.findMany({
        select: { code: true, updatedAt: true },
        orderBy: { code: "asc" },
      })

      return parseOrReport(CourseSitemapEntrySchema.array(), courses)
    },
  }
}
