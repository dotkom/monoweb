import type { DBClient } from "@dotkomonline/grades-db"
import pLimit from "p-limit"
import { createConfiguration } from "../configuration"
import { createServiceLayer, createThirdPartyClients } from "../modules/core"
import type { CourseService } from "../modules/course/course-service"
import type {
  Course,
  CourseCode,
  CourseCreditReductionWrite,
  CourseId,
  Department,
  Faculty,
  GradeType,
} from "../modules/course/course-types"
import type { GradeDistributionService } from "../modules/grade-distribution/grade-distribution-service"
import {
  calculateCourseGradeType,
  calculateCourseStatistics,
  getLastThreeYearsGradeDistributions,
  type GradeDistribution,
  type GradeDistributionWrite,
} from "../modules/grade-distribution/grade-distribution-types"
import { getAllCourseRecords, getAllGrades } from "./dbh/dbh-service"
import type { DbhCourseRecord, DbhSemesterGrade } from "./dbh/dbh-types"
import {
  buildCourseCreateWrite,
  buildCourseUpdatePatch,
  calculateTaughtFrom,
  calculateTaughtTo,
  getDbhGradeType,
  mergeNtnuCreditReductions,
  parseDbhGradeResultsToGradeDistributionWrites,
  type CourseSyncData,
} from "./grades-sync-utils"
import type { CreditsReduction } from "./ntnu/ntnu-course-parser"
import { scrapeNtnuCourse, type NtnuCourseScrapeResult } from "./ntnu/ntnu-scraper"

type CourseSyncContext = {
  courseService: CourseService
  gradeDistributionService: GradeDistributionService
  dbClient: DBClient
  coursesByCode: Partial<Record<CourseCode, Course>>
  dbhCourseRecordsByCode: Partial<Record<CourseCode, DbhCourseRecord[]>>
  dbhGradeResultsByCode: Partial<Record<CourseCode, DbhSemesterGrade[]>>
  semesterResultsByCourseId: Partial<Record<CourseId, GradeDistribution[]>>
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
const gradeDistributionService = serviceLayer.gradeDistributionService

const faculties = await courseService.findManyFaculties(prisma)
const departments = await courseService.findManyDepartments(prisma)

const allDbhSemesterCourseRecords = await getAllCourseRecords()
const allDbhGradeResults = await getAllGrades()

const courses = await courseService.findAll(prisma)
const semesterResults = await gradeDistributionService.findMany(prisma)

const dbhCourseRecordsByCode = Object.groupBy(allDbhSemesterCourseRecords, (record) => record.code)
const dbhGradeResultsByCode = Object.groupBy(allDbhGradeResults, (record) => record.code)
const semesterResultsByCourseId = Object.groupBy(semesterResults, (grade) => grade.courseId)
const coursesByCode = Object.fromEntries(courses.map((course) => [course.code, course]))

const facultiesByCode = Object.fromEntries(faculties.map((faculty) => [faculty.code, faculty]))
const departmentsByCode = Object.fromEntries(departments.map((department) => [department.code, department]))

const validCourseCodes = new Set(
  allDbhGradeResults.map((result) => result.code).filter((code) => validateCourseCode(code))
)

const ntnuCreditReductions: Record<CourseCode, CreditsReduction[]> = {}

const ctx: CourseSyncContext = {
  courseService,
  gradeDistributionService,
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

const creditReductionCount = Object.values(ntnuCreditReductions).flatMap((reductions) =>
  reductions.map((reduction) => reduction.overlapCourseCode)
).length

console.log(`Syncing ${creditReductionCount} credit reductions...`)

// We sync credit reductions for all courses after all courses are synced to make sure both courses in the relation exist
const allCoursesAfterSync = await courseService.findAll(prisma)
await syncNtnuCreditReductions(ntnuCreditReductions, allCoursesAfterSync)

async function syncCourse(code: CourseCode, ctx: CourseSyncContext) {
  const sourceData = await buildCourseSourceData(code, ctx)
  if (!sourceData) {
    return
  }

  const syncedCourse = await syncCourseData(sourceData, ctx)
  if (!syncedCourse) {
    return
  }

  ntnuCreditReductions[code] = mergeNtnuCreditReductions(
    sourceData.ntnuScrapeResult.no?.creditReductions ?? [],
    sourceData.ntnuScrapeResult.en?.creditReductions ?? []
  )

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

  // TODO: Temporarily disabled until we heuristic is improved
  /* 
  const ntnuTaughtSemesters = getPreferredNtnuTaughtSemesters(ntnuScrapeResult) */
  /* 
  const mappedDbhSemesterGrades = dbhSemesterGrades.map((dbhGrade) => ({
    ...dbhGrade,
    semester: mapDbhSemesterToSummer(dbhGrade, existingSemesterGrades, ntnuTaughtSemesters),
  })) */

  const gradeType = getDbhGradeType(dbhSemesterGrades)

  return {
    code,
    existingCourse,
    dbhCourseRecords,
    dbhSemesterGrades: dbhSemesterGrades,
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
  existingSemesterGrades: GradeDistribution[]
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

  const semesterResultWrites: GradeDistributionWrite[] = parseDbhGradeResultsToGradeDistributionWrites(
    newSemesterResults,
    syncedCourse.id
  )

  if (semesterResultWrites.length === 0) {
    return sourceData.existingSemesterGrades
  }

  const createdGrades = await ctx.gradeDistributionService.createMany(ctx.dbClient, semesterResultWrites)
  const allGradesForCourse = [...sourceData.existingSemesterGrades, ...createdGrades]

  return allGradesForCourse
}

async function syncCourseStatistics(
  syncedCourse: Course,
  ctx: CourseSyncContext,
  allGradesForCourse: GradeDistribution[]
) {
  const courseStatisticsAllYears = calculateCourseStatistics(allGradesForCourse)
  const courseStatisticsLastThreeYears = calculateCourseStatistics(
    getLastThreeYearsGradeDistributions(allGradesForCourse)
  )

  const gradeType = calculateCourseGradeType(allGradesForCourse)

  await ctx.courseService.update(ctx.dbClient, syncedCourse.id, {
    candidateCount: courseStatisticsAllYears.candidateCount,
    averageGradeLastThreeYears: courseStatisticsLastThreeYears.averageGrade,
    passRateLastThreeYears: courseStatisticsLastThreeYears.passRate,
    gradeType,
  })
}

async function syncNtnuCreditReductions(
  creditReductions: Record<CourseCode, CreditsReduction[]>,
  allCoursesAfterSync: Course[]
) {
  const coursesByCode = new Map(allCoursesAfterSync.map((course) => [course.code, course]))

  const creditReductionWrites: CourseCreditReductionWrite[] = Object.entries(creditReductions).flatMap(
    ([code, reductions]) => {
      const course = coursesByCode.get(code)
      if (course === undefined) {
        return []
      }

      return reductions
        .map((reduction) => {
          const overlapCourse = coursesByCode.get(reduction.overlapCourseCode)
          if (overlapCourse === undefined) {
            return null
          }

          return {
            courseId: course.id,
            overlapCourseId: overlapCourse.id,
            reductionAmount: reduction.reductionCredits,
          }
        })
        .filter((write) => write !== null)
    }
  )

  for (const write of creditReductionWrites) {
    await ctx.courseService.upsertCreditReduction(ctx.dbClient, write)
  }
}
