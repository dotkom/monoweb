import { Prisma, type DBHandle } from "@dotkomonline/grades-db"
import { parseOrReport } from "../../invariant"
import { type Course, type CourseFilterQuery, type CourseId, CourseSchema, type CourseWrite } from "./course-types"
import type { Pageable } from "@dotkomonline/utils"

export interface CourseRepository {
  findMany(handle: DBHandle, query: CourseFilterQuery, page: Pageable): Promise<Course[]>
  find(handle: DBHandle, code: string): Promise<Course>
  create(handle: DBHandle, data: CourseWrite): Promise<Course>
  update(handle: DBHandle, id: CourseId, data: Partial<CourseWrite>): Promise<Course>
}

export function getCourseRepository(): CourseRepository {
  return {
    async findMany(handle, query, page) {
      const sortOrder = query.orderBy ?? "desc"
      const sortBy = query.sortBy ?? []
      const sortColumnMap = {
        AVERAGE_GRADE: "average_grade",
        PASS_RATE: "pass_rate",
        STUDENT_COUNT: "student_count",
      } as const

      const sortDirection = sortOrder === "asc" ? "ASC" : "DESC"
      const orderByClause =
        sortBy.length > 0
          ? sortBy.map((sortKey) => `"${sortColumnMap[sortKey]}" ${sortDirection}`).join(", ")
          : '"id" DESC'

      const bySearch = query.bySearch
      const searchContains = bySearch ? `%${bySearch}%` : undefined

      const searchWhereSql = searchContains
        ? Prisma.sql`AND ("code" ILIKE ${searchContains} OR "norwegian_name" ILIKE ${searchContains} OR "english_name" ILIKE ${searchContains})`
        : Prisma.empty
      const cursorWhereSql = page.cursor ? Prisma.sql`AND "id" < ${page.cursor}` : Prisma.empty

      const courses = await handle.$queryRaw<Course[]>`
        SELECT
          "id",
          "code",
          "norwegian_name" AS "norwegianName",
          "english_name" AS "englishName",
          "credits",
          "study_level" AS "studyLevel",
          "grade_type" AS "gradeType",
          "first_year_taught" AS "firstYearTaught",
          "last_year_taught" AS "lastYearTaught",
          "content",
          "teaching_methods" AS "teachingMethods",
          "learning_outcomes" AS "learningOutcomes",
          "exam_type" AS "examType",
          "student_count" AS "studentCount",
          "average_grade" AS "averageGrade",
          "pass_rate" AS "passRate",
          "created_at" AS "createdAt",
          "updated_at" AS "updatedAt",
          "taught_semesters" AS "taughtSemesters",
          "teaching_languages" AS "teachingLanguages",
          "campuses",
          "faculty_id" AS "facultyId",
          "department_id" AS "departmentId"
        FROM "course"
        WHERE 1 = 1
        ${searchWhereSql}
        ${cursorWhereSql}
        ORDER BY
          -- To update ranking, copy-paste rank_search function from
          -- 20260415160933_add_course_ranking_function into a new migration
          rank_search(code, norwegian_name, english_name, last_year_taught, ${bySearch ?? null}) ASC,
          ${Prisma.raw(orderByClause)}
        LIMIT ${page.take}
      `

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
