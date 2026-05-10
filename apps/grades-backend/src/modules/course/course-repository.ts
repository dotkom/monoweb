import { type DBHandle, Prisma } from "@dotkomonline/grades-db"
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
      const sortColumnMap = {
        AVERAGE_GRADE: "average_grade",
        PASS_RATE: "pass_rate",
        CANDIDATE_COUNT: "candidate_count",
      } as const

      const sortDirection = sortOrder === "asc" ? "ASC" : "DESC"
      const orderByClause =
        sortBy.length > 0
          ? `${sortBy.map((sortKey) => `"${sortColumnMap[sortKey]}" ${sortDirection}`).join(", ")}, "id" DESC`
          : '"id" DESC'

      const bySearch = query.bySearch?.trim()
      const searchContains = bySearch ? `%${bySearch}%` : undefined

      const searchWhereSql = searchContains
        ? Prisma.sql`AND ("code" ILIKE ${searchContains} OR "name_no" ILIKE ${searchContains} OR "name_en" ILIKE ${searchContains})`
        : Prisma.empty

      const bySemester = query.bySemester ?? []
      const byTeachingLanguage = query.byTeachingLanguage ?? []
      const byCampus = query.byCampus ?? []
      const byMinGrade = query.byMinGrade

      const semesterWhereSql =
        bySemester.length > 0
          ? Prisma.sql`AND "taught_semesters" && ARRAY[${Prisma.join(bySemester)}]::"semester"[]`
          : Prisma.empty

      const teachingLanguageWhereSql =
        byTeachingLanguage.length > 0
          ? Prisma.sql`AND "teaching_languages" && ARRAY[${Prisma.join(byTeachingLanguage)}]::"teaching_language"[]`
          : Prisma.empty

      const campusWhereSql =
        byCampus.length > 0 ? Prisma.sql`AND "campuses" && ARRAY[${Prisma.join(byCampus)}]::"campus"[]` : Prisma.empty

      const minGradeWhereSql =
        byMinGrade != null
          ? Prisma.sql`AND "average_grade" >= ${mapLetterGradeFilterToMinAverageGrade(byMinGrade)}`
          : Prisma.empty

      const courses = await handle.$queryRaw<Course[]>`
        SELECT
          "id",
          "code",
          "name_no" AS "nameNo",
          "name_en" AS "nameEn",
          "credits",
          "study_level" AS "studyLevel",
          "grade_type" AS "gradeType",
          "first_year_taught" AS "firstYearTaught",
          "last_year_taught" AS "lastYearTaught",
          "content_no" AS "contentNo",
          "content_en" AS "contentEn",
          "teaching_methods_no" AS "teachingMethodsNo",
          "teaching_methods_en" AS "teachingMethodsEn",
          "learning_outcomes_no" AS "learningOutcomesNo",
          "learning_outcomes_en" AS "learningOutcomesEn",
          "exam_type_no" AS "examTypeNo",
          "exam_type_en" AS "examTypeEn",
          "candidate_count" AS "candidateCount",
          "average_grade" AS "averageGrade",
          "pass_rate" AS "passRate",
          "created_at" AS "createdAt",
          "updated_at" AS "updatedAt",
          to_jsonb("taught_semesters") AS "taughtSemesters",
          to_jsonb("teaching_languages") AS "teachingLanguages",
          to_jsonb("campuses") AS "campuses",
          "faculty_id" AS "facultyId",
          "department_id" AS "departmentId",
          "latest_year_checked_for_ntnu_data" AS "latestYearCheckedForNtnuData"
        FROM "course"
        WHERE 1 = 1
        ${searchWhereSql}
        ${semesterWhereSql}
        ${teachingLanguageWhereSql}
        ${campusWhereSql}
        ${minGradeWhereSql}
        ORDER BY
          course_rank_score(code, name_no, name_en, last_year_taught, ${bySearch || null}) DESC,
          ${Prisma.raw(orderByClause)}
        OFFSET ${offset}
        LIMIT ${limit}
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
