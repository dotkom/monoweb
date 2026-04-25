import type { DBClient } from "@dotkomonline/grades-db"
import pLimit from "p-limit"
import { createConfiguration } from "../configuration"
import { createServiceLayer, createThirdPartyClients } from "../modules/core"
import type { CourseService } from "../modules/course/course-service"
import type { Course, CourseCode, CourseId, Department, Faculty, GradeType } from "../modules/course/course-types"
import type { GradeService } from "../modules/grade/grade-service"
import type { Grade, GradeWrite } from "../modules/grade/grade-types"
import { getAllCourseRecords, getAllGrades } from "./dbh/dbh-service"
import type { DbhCourseRecord, DbhSemesterGrade } from "./dbh/dbh-types"
import {
  buildCourseCreateWrite,
  buildCourseUpdatePatch,
  calculateCourseGradeType,
  calculateCourseStatistics,
  calculateTaughtFrom,
  calculateTaughtTo,
  getDbhGradeType,
  getPreferredNtnuTaughtSemesters,
  mapDbhSemesterToSummer,
  parseDbhGradeResultsToGradeWrites,
  type CourseSyncData,
} from "./grades-sync-utils"
import { scrapeNtnuCourse, type NtnuCourseScrapeResult } from "./ntnu/ntnu-scraper"

type CourseSyncContext = {
  courseService: CourseService
  gradeService: GradeService
  dbClient: DBClient
  coursesByCode: Partial<Record<CourseCode, Course>>
  dbhCourseRecordsByCode: Partial<Record<CourseCode, DbhCourseRecord[]>>
  dbhGradeResultsByCode: Partial<Record<CourseCode, DbhSemesterGrade[]>>
  semesterResultsByCourseId: Partial<Record<CourseId, Grade[]>>
  facultiesByCode: Partial<Record<string, Faculty>>
  departmentsByCode: Partial<Record<string, Department>>
}

const COURSE_CODE_REGEX = /^[a-zA-Z0-9_æøåÆØÅ-]+$/

function validateCourseCode(code: string) {
  return COURSE_CODE_REGEX.test(code)
}

const SYNC_CONCURRENCY = 4
const limit = pLimit(SYNC_CONCURRENCY)

const configuration = createConfiguration()
const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies)
const prisma = serviceLayer.prisma

const courseService = serviceLayer.courseService
const gradeService = serviceLayer.gradeService

const faculties = await courseService.findManyFaculties(prisma)
const departments = await courseService.findManyDepartments(prisma)

const allDbhSemesterCourseRecords = await getAllCourseRecords()
const allDbhGradeResults = await getAllGrades()

const courses = await courseService.findMany(prisma, {}, { take: Number.MAX_SAFE_INTEGER })
const semesterResults = await gradeService.findMany(prisma)

const dbhCourseRecordsByCode = Object.groupBy(allDbhSemesterCourseRecords, (record) => record.code)
const dbhGradeResultsByCode = Object.groupBy(allDbhGradeResults, (record) => record.code)
const semesterResultsByCourseId = Object.groupBy(semesterResults, (grade) => grade.courseId)
const coursesByCode = Object.fromEntries(courses.map((course) => [course.code, course]))

const facultiesByCode = Object.fromEntries(faculties.map((faculty) => [faculty.code, faculty]))
const departmentsByCode = Object.fromEntries(departments.map((department) => [department.code, department]))

const validCourseCodes = new Set(
  allDbhGradeResults.map((result) => result.code).filter((code) => validateCourseCode(code))
)

const ctx: CourseSyncContext = {
  courseService,
  gradeService,
  dbClient: prisma,
  coursesByCode,
  dbhCourseRecordsByCode,
  dbhGradeResultsByCode,
  semesterResultsByCourseId,
  facultiesByCode,
  departmentsByCode,
}

await Promise.all(
  Array.from(validCourseCodes).map((code) =>
    limit(async () => {
      try {
        await syncCourse(code, ctx)
      } catch (error) {
        console.error(`Failed syncing course ${code}`, error)
      }
    })
  )
)

async function syncCourse(code: CourseCode, ctx: CourseSyncContext) {
  const sourceData = await buildCourseSourceData(code, ctx)
  if (!sourceData) {
    return
  }

  const syncedCourse = await syncCourseData(sourceData, ctx)
  if (!syncedCourse) {
    return
  }

  const allGradesForCourse = await syncSemesterResults(sourceData, syncedCourse, ctx)
  await syncCourseStatistics(syncedCourse, ctx, allGradesForCourse)

  console.log(`Synced course ${code}`)
}

async function buildCourseSourceData(code: CourseCode, ctx: CourseSyncContext): Promise<CourseSourceData | null> {
  const existingCourse = ctx.coursesByCode[code]
  const dbhCourseRecords = ctx.dbhCourseRecordsByCode[code] ?? []
  const existingSemesterGrades = existingCourse ? (ctx.semesterResultsByCourseId[existingCourse.id] ?? []) : []

  // Only sync grades with candidates
  const dbhSemesterGrades = (ctx.dbhGradeResultsByCode[code] ?? []).filter((dbhGradeResult) => dbhGradeResult.count > 0)

  // Don't sync courses that have no grade data
  if (dbhSemesterGrades.length === 0) {
    return null
  }

  const mostRecentDbhCourseRecord = dbhCourseRecords.at(-1)
  const faculty = mostRecentDbhCourseRecord ? ctx.facultiesByCode[mostRecentDbhCourseRecord.facultyCode] : undefined
  const department = mostRecentDbhCourseRecord
    ? ctx.departmentsByCode[mostRecentDbhCourseRecord.departmentCode]
    : undefined

  const taughtFrom = calculateTaughtFrom(dbhSemesterGrades, dbhCourseRecords)
  const taughtTo = calculateTaughtTo(dbhCourseRecords, dbhSemesterGrades)

  const ntnuScrapeResult = await scrapeNtnuCourse(
    code,
    existingCourse?.latestYearCheckedForNtnuData ?? undefined,
    taughtTo ?? undefined
  )

  const ntnuTaughtSemesters = getPreferredNtnuTaughtSemesters(ntnuScrapeResult)

  const mappedDbhSemesterGrades = dbhSemesterGrades.map((dbhGrade) => ({
    ...dbhGrade,
    semester: mapDbhSemesterToSummer(dbhGrade, existingSemesterGrades, ntnuTaughtSemesters),
  }))

  const gradeType = getDbhGradeType(mappedDbhSemesterGrades)

  return {
    code,
    existingCourse,
    dbhCourseRecords,
    dbhSemesterGrades: mappedDbhSemesterGrades,
    existingSemesterGrades,
    faculty,
    department,
    ntnuScrapeResult,
    taughtFrom,
    taughtTo,
    gradeType,
  }
}

type CourseSourceData = {
  code: CourseCode
  existingCourse?: Course
  dbhCourseRecords: DbhCourseRecord[]
  dbhSemesterGrades: DbhSemesterGrade[]
  existingSemesterGrades: Grade[]
  faculty?: Faculty
  department?: Department
  ntnuScrapeResult: NtnuCourseScrapeResult
  taughtFrom: number
  taughtTo: number | null
  gradeType: GradeType
}

async function syncCourseData(sourceData: CourseSourceData, ctx: CourseSyncContext) {
  const courseSyncData: CourseSyncData = {
    code: sourceData.code,
    dbhCourseRecords: sourceData.dbhCourseRecords,
    ntnuCourse: sourceData.ntnuScrapeResult,
    taughtFrom: sourceData.taughtFrom,
    taughtTo: sourceData.taughtTo,
    faculty: sourceData.faculty,
    department: sourceData.department,
    gradeType: sourceData.gradeType,
  }

  if (sourceData.existingCourse) {
    const data = buildCourseUpdatePatch(courseSyncData)

    return await ctx.courseService.update(ctx.dbClient, sourceData.existingCourse.id, data)
  }

  const data = buildCourseCreateWrite(courseSyncData)

  if (!data) {
    return null
  }

  return await ctx.courseService.create(ctx.dbClient, data)
}

async function syncSemesterResults(sourceData: CourseSourceData, syncedCourse: Course, ctx: CourseSyncContext) {
  // Up until 2021, we got grade data from an internal api `karstat`, which had more accurate data than DBH.
  // For years after 2021, we sync grades normally.
  // For years up to and including 2021, we avoid mixing DBH data into years that
  // already have stored grades, since those grades may originate from Karstat.
  const existingYears = new Set(sourceData.existingSemesterGrades.map((grade) => grade.year))

  const relevantDbhSemesterGrades = sourceData.dbhSemesterGrades.filter((grade) => {
    if (grade.year > 2021) {
      return true
    }

    return !existingYears.has(grade.year)
  })

  const newSemesterResults = relevantDbhSemesterGrades.filter((dbhSemesterResult) => {
    return !sourceData.existingSemesterGrades.some(
      (existingResult) =>
        existingResult.year === dbhSemesterResult.year && existingResult.semester === dbhSemesterResult.semester
    )
  })

  const semesterResultWrites: GradeWrite[] = parseDbhGradeResultsToGradeWrites(newSemesterResults, syncedCourse.id)

  if (semesterResultWrites.length === 0) {
    return sourceData.existingSemesterGrades
  }

  const createdGrades = await ctx.gradeService.createMany(ctx.dbClient, semesterResultWrites)
  const allGradesForCourse = [...sourceData.existingSemesterGrades, ...createdGrades]

  return allGradesForCourse
}

async function syncCourseStatistics(syncedCourse: Course, ctx: CourseSyncContext, allGradesForCourse: Grade[]) {
  const courseStatistics = calculateCourseStatistics(allGradesForCourse)
  const gradeType = calculateCourseGradeType(allGradesForCourse)
  const patch = { ...courseStatistics, gradeType }

  await ctx.courseService.update(ctx.dbClient, syncedCourse.id, patch)
}
