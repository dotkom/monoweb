import type { Campus, StudyLevel, TeachingLanguage } from "@dotkomonline/grades-db"
import type {
  CourseCode,
  CourseId,
  CourseWrite,
  Department,
  Faculty,
  GradeType,
  Semester,
} from "../modules/course/course-types"
import type { Grade, GradeWrite } from "../modules/grade/grade-types"
import type { DbhCourseRecord, DbhSemesterGrade } from "./dbh/dbh-types"
import type { NtnuCourseScrapeResult } from "./ntnu/ntnu-scraper"

/**
 * Calculates the first year a course was taught based on the first year it had either a grade or a course record in DBH
 */
export function calculateTaughtFrom(
  dbhSemesterGrades: DbhSemesterGrade[],
  dbhCourseRecords: DbhCourseRecord[]
): number {
  if (dbhSemesterGrades.length === 0 && dbhCourseRecords.length === 0) {
    return 0
  }

  const yearsWithGrades = dbhSemesterGrades.map((grade) => grade.year)
  const yearsWithCourseRecords = dbhCourseRecords.map((course) => course.year)

  const firstGradeYear = Math.min(...yearsWithGrades)
  const firstCourseYear = Math.min(...yearsWithCourseRecords)

  return Math.min(firstGradeYear, firstCourseYear)
}

/**
 * Calculates the last year a course was taught based on the last year it had either a grade or a course record in DBH,
 * taking into account if the course has been discontinued and not reintroduced according to DBH data.
 * Returns null if the course is currently taught or if there is not enough data to determine this
 */
export function calculateTaughtTo(
  dbhCourseRecords: DbhCourseRecord[],
  dbhSemesterGrades: DbhSemesterGrade[]
): number | null {
  const discontinuedCourseRecords = dbhCourseRecords.filter((course) => course.status === "DISCONTINUED")

  if (discontinuedCourseRecords.length === 0) {
    return null
  }

  const discontinuedYear = Math.max(...discontinuedCourseRecords.map((course) => course.year))
  const latestCourseYear = Math.max(...dbhCourseRecords.map((course) => course.year))
  const latestGradeYear = Math.max(...dbhSemesterGrades.map((grade) => grade.year))

  // If there has been activity (course records or grades) after the discontinued year, the course has been reintroduced
  if (Math.max(latestCourseYear, latestGradeYear) > discontinuedYear) {
    return null
  }

  // DBH marks a course as discontinued the year after the last year it was taught
  return discontinuedYear - 1
}

export function parseDbhGradeResultsToGradeWrites(
  dbhGradeResults: DbhSemesterGrade[],
  courseId: CourseId
): GradeWrite[] {
  const gradesBySemester = Object.groupBy(
    dbhGradeResults,
    (gradeResult) => `${gradeResult.year}-${gradeResult.semester}`
  )

  const writes: GradeWrite[] = []

  // DBH returns one grade record per grade type ("A", "B", "PASSED", "FAILED" etc) per semester,
  // so we group by semester and then aggregate the counts to create write objects
  for (const semesterGrades of Object.values(gradesBySemester)) {
    if (!semesterGrades || semesterGrades.length === 0) {
      continue
    }

    const first = semesterGrades[0]

    const gradeWrite: GradeWrite = {
      courseId,
      year: first.year,
      semester: first.semester,
      gradeACount: 0,
      gradeBCount: 0,
      gradeCCount: 0,
      gradeDCount: 0,
      gradeECount: 0,
      gradeFCount: 0,
      failedCount: 0,
      passedCount: 0,
    }

    for (const semesterGrade of semesterGrades) {
      switch (semesterGrade.grade) {
        case "A":
          gradeWrite.gradeACount += semesterGrade.count
          break
        case "B":
          gradeWrite.gradeBCount += semesterGrade.count
          break
        case "C":
          gradeWrite.gradeCCount += semesterGrade.count
          break
        case "D":
          gradeWrite.gradeDCount += semesterGrade.count
          break
        case "E":
          gradeWrite.gradeECount += semesterGrade.count
          break
        case "F":
          gradeWrite.gradeFCount += semesterGrade.count
          break
        case "PASSED":
          gradeWrite.passedCount += semesterGrade.count
          break
        case "FAILED":
          gradeWrite.failedCount += semesterGrade.count
          break
      }
    }

    writes.push(gradeWrite)
  }

  return writes
}

export type CourseSyncData = {
  code: CourseCode
  dbhCourseRecords: DbhCourseRecord[]
  ntnuCourse: NtnuCourseScrapeResult
  taughtFrom: number
  taughtTo: number | null
  faculty: Faculty | undefined
  department: Department | undefined
  gradeType: GradeType
}

export function buildCourseUpdatePatch(data: CourseSyncData): Partial<CourseWrite> {
  const resolved = resolveCourseSourceData(data.dbhCourseRecords, data.ntnuCourse)

  const updatePatch: Partial<CourseWrite> = {
    ...resolved,
    firstYearTaught: data.taughtFrom > 0 ? data.taughtFrom : undefined,
    lastYearTaught: data.taughtTo,
    facultyId: data.faculty?.id,
    departmentId: data.department?.id,
    latestYearCheckedForNtnuData: data.ntnuCourse.latestYearCheckedForNtnuData,
  }

  return updatePatch
}

export function buildCourseCreateWrite(data: CourseSyncData): CourseWrite | null {
  const resolved = resolveCourseSourceData(data.dbhCourseRecords, data.ntnuCourse)

  if (!resolved.nameNo) {
    return null
  }

  return {
    code: data.code,
    nameNo: resolved.nameNo,
    nameEn: resolved.nameEn ?? null,

    facultyId: data.faculty?.id,
    departmentId: data.department?.id,

    firstYearTaught: data.taughtFrom,
    lastYearTaught: data.taughtTo,
    gradeType: data.gradeType,

    averageGrade: 0,
    passRate: 0,
    candidateCount: 0,

    credits: resolved.credits ?? null,
    studyLevel: resolved.studyLevel ?? "UNKNOWN",
    taughtSemesters: resolved.taughtSemesters ?? [],
    teachingLanguages: resolved.teachingLanguages ?? [],
    campuses: resolved.campuses ?? [],

    contentNo: resolved.contentNo ?? null,
    contentEn: resolved.contentEn ?? null,
    learningOutcomesNo: resolved.learningOutcomesNo ?? null,
    learningOutcomesEn: resolved.learningOutcomesEn ?? null,
    teachingMethodsNo: resolved.teachingMethodsNo ?? null,
    teachingMethodsEn: resolved.teachingMethodsEn ?? null,
    examTypeNo: resolved.examTypeNo ?? null,
    examTypeEn: resolved.examTypeEn ?? null,

    latestYearCheckedForNtnuData: data.ntnuCourse.latestYearCheckedForNtnuData,
  }
}

type ResolvedCourseSourceData = Partial<
  Pick<
    CourseWrite,
    | "nameNo"
    | "nameEn"
    | "credits"
    | "studyLevel"
    | "taughtSemesters"
    | "teachingLanguages"
    | "campuses"
    | "contentNo"
    | "contentEn"
    | "learningOutcomesNo"
    | "learningOutcomesEn"
    | "teachingMethodsNo"
    | "teachingMethodsEn"
    | "examTypeNo"
    | "examTypeEn"
  >
>

/**
 * Merges data from DBH and NTNU, prioritizing data from NTNU
 */
function resolveCourseSourceData(
  dbhCourseRecords: DbhCourseRecord[],
  ntnuCourse: NtnuCourseScrapeResult
): ResolvedCourseSourceData {
  const dbh = dbhCourseRecords.at(-1)
  const no = ntnuCourse.no
  const en = ntnuCourse.en

  // Take all semesters from DBH course records for the latest year we have course records for, as DBH only returns one course record per semester per year
  const dbhSemesters = getDbhSemestersForYear(dbh?.year, dbhCourseRecords)
  const dbhTeachingLanguage = dbh?.teachingLanguage

  let studyLevel: StudyLevel | undefined

  if (no && no.studyLevel !== "UNKNOWN") {
    studyLevel = no.studyLevel
  } else if (en && en.studyLevel !== "UNKNOWN") {
    studyLevel = en.studyLevel
  } else if (dbh && dbh.studyLevel !== "UNKNOWN") {
    studyLevel = dbh.studyLevel
  }

  let taughtSemesters: Semester[] | undefined

  const ntnuTaughtSemesters = getPreferredNtnuTaughtSemesters(ntnuCourse)

  if (ntnuTaughtSemesters.length > 0) {
    taughtSemesters = ntnuTaughtSemesters
  } else if (dbhSemesters.length > 0) {
    taughtSemesters = dbhSemesters
  }

  // Summer is only for grades. A course is never officially taught in the summer
  taughtSemesters = taughtSemesters?.filter((semester) => semester !== "SUMMER")

  let teachingLanguages: TeachingLanguage[] | undefined

  if (no?.teachingLanguages.length) {
    teachingLanguages = no.teachingLanguages
  } else if (en?.teachingLanguages.length) {
    teachingLanguages = en.teachingLanguages
  } else if (dbhTeachingLanguage) {
    teachingLanguages = [dbhTeachingLanguage]
  }

  let campuses: Campus[] | undefined

  if (no?.campuses.length) {
    campuses = no.campuses
  } else if (en?.campuses.length) {
    campuses = en.campuses
  }

  return {
    nameNo: no?.name || dbh?.nameNo || undefined,
    nameEn: en?.name || undefined,
    credits: no?.credits ?? en?.credits ?? dbh?.credits ?? undefined,
    studyLevel,
    taughtSemesters,
    teachingLanguages,
    campuses,
    contentNo: no?.content || undefined,
    contentEn: en?.content || undefined,
    learningOutcomesNo: no?.learningOutcomes || undefined,
    learningOutcomesEn: en?.learningOutcomes || undefined,
    teachingMethodsNo: no?.teachingMethods || undefined,
    teachingMethodsEn: en?.teachingMethods || undefined,
    examTypeNo: no?.examType || undefined,
    examTypeEn: en?.examType || undefined,
  }
}

function getDbhSemestersForYear(year: number | undefined, dbhCourseRecords: DbhCourseRecord[]): Semester[] {
  if (!year || dbhCourseRecords.length === 0) {
    return []
  }

  const relevantCourseRecords = dbhCourseRecords.filter((record) => record.year === year && record.semester !== null)

  const semesters = relevantCourseRecords.map((record) => record.semester as Semester)

  return Array.from(new Set(semesters))
}

export function calculateCourseStatistics(grades: Grade[]): {
  candidateCount: number
  averageGrade: number
  passRate: number
} {
  if (grades.length === 0) {
    return { candidateCount: 0, averageGrade: 0, passRate: 0 }
  }

  const candidateCount = grades.reduce((sum, grade) => sum + getGradeCandidateCount(grade), 0)
  const failedCount = grades.reduce((sum, grade) => sum + getFailedCandidateCount(grade), 0)
  const letterGradeCandidateCount = grades.reduce((sum, grade) => sum + getLetterGradeCandidateCount(grade), 0)

  const averageGradePoints = grades.reduce(
    (sum, grade) =>
      sum +
      grade.gradeACount * 5 +
      grade.gradeBCount * 4 +
      grade.gradeCCount * 3 +
      grade.gradeDCount * 2 +
      grade.gradeECount * 1,
    0
  )

  const averageGrade = letterGradeCandidateCount === 0 ? 0 : averageGradePoints / letterGradeCandidateCount
  const passRate = candidateCount === 0 ? 0 : ((candidateCount - failedCount) * 100) / candidateCount

  return { candidateCount, averageGrade, passRate }
}

type GradeCountFields = Pick<
  Grade,
  | "gradeACount"
  | "gradeBCount"
  | "gradeCCount"
  | "gradeDCount"
  | "gradeECount"
  | "gradeFCount"
  | "passedCount"
  | "failedCount"
>

export function getGradeCandidateCount(grade: GradeCountFields) {
  return (
    grade.gradeACount +
    grade.gradeBCount +
    grade.gradeCCount +
    grade.gradeDCount +
    grade.gradeECount +
    grade.gradeFCount +
    grade.passedCount +
    grade.failedCount
  )
}

export function getLetterGradeCandidateCount(grade: GradeCountFields) {
  return (
    grade.gradeACount +
    grade.gradeBCount +
    grade.gradeCCount +
    grade.gradeDCount +
    grade.gradeECount +
    grade.gradeFCount
  )
}

export function getFailedCandidateCount(grade: GradeCountFields) {
  return grade.gradeFCount + grade.failedCount
}

function getPreferredGradeType(hasLetterGrades: boolean, hasPassFailGrades: boolean): GradeType {
  // If there are both letter grades and pass/fail grades, we prefer letter grades as they contain more information
  if (hasLetterGrades || !hasPassFailGrades) {
    return "LETTER"
  }

  return "PASS_FAIL"
}

export function calculateCourseGradeType(grades: Grade[]): GradeType {
  const hasLetterGrades = grades.some((grade) => getLetterGradeCandidateCount(grade) > 0)
  const hasPassedFailedGrades = grades.some((grade) => grade.passedCount > 0 || grade.failedCount > 0)

  return getPreferredGradeType(hasLetterGrades, hasPassedFailedGrades)
}

export function getDbhGradeType(dbhGradeResults: DbhSemesterGrade[]): GradeType {
  const hasLetterGrades = dbhGradeResults.some((grade) => ["A", "B", "C", "D", "E", "F"].includes(grade.grade))
  const hasPassFailGrades = dbhGradeResults.some((grade) => ["PASSED", "FAILED"].includes(grade.grade))

  return getPreferredGradeType(hasLetterGrades, hasPassFailGrades)
}

export function getPreferredNtnuTaughtSemesters(ntnuCourse: NtnuCourseScrapeResult): Semester[] {
  const taughtSemestersNo = ntnuCourse.no?.taughtSemesters ?? []
  const taughtSemestersEn = ntnuCourse.en?.taughtSemesters ?? []

  if (taughtSemestersNo.length > 0) {
    return taughtSemestersNo
  } else if (taughtSemestersEn.length > 0) {
    return taughtSemestersEn
  }

  return []
}

/**
 * DBH only reports spring and autumn semesters, but we want to support summer semesters as well.
 *
 * This tries to match DBH grade semesters to SUMMER using historical data and NTNU taughtSemesters
 *
 * Rules:
 * - Keep DBH SUMMER as SUMMER
 * - Never remap if the same year already has the exact DBH semester stored
 * - Only remap SPRING/AUTUMN to SUMMER from historical course patterns if the same year
 *   already has a SUMMER grade in the database
 * - If there is no existing SUMMER grade for that year, fall back to NTNU only when NTNU
 *   says the course is taught in exactly one semester
 * - Otherwise keep the DBH semester unchanged
 */
export function mapDbhSemesterToSummer(
  dbhSemesterGrade: DbhSemesterGrade,
  existingGradesForCourse: Grade[],
  ntnuTaughtSemesters: Semester[]
): Semester {
  const dbhSemester = dbhSemesterGrade.semester

  if (dbhSemester === "SUMMER") {
    return "SUMMER"
  }

  const existingGradesForSameYear = existingGradesForCourse.filter((grade) => grade.year === dbhSemesterGrade.year)

  const hasExistingSpring = existingGradesForSameYear.some((grade) => grade.semester === "SPRING")
  const hasExistingSummer = existingGradesForSameYear.some((grade) => grade.semester === "SUMMER")
  const hasExistingAutumn = existingGradesForSameYear.some((grade) => grade.semester === "AUTUMN")

  // If the exact semester already exists for the same year, keep DBH as-is
  if (dbhSemester === "SPRING" && hasExistingSpring) {
    return "SPRING"
  }

  if (dbhSemester === "AUTUMN" && hasExistingAutumn) {
    return "AUTUMN"
  }

  // Only use historical mapping when the same year already has SUMMER in DB
  if (hasExistingSummer) {
    const { summerRepresentsSpring, summerRepresentsAutumn } = getHistoricalSummerMapping(existingGradesForCourse)

    if (dbhSemester === "SPRING" && summerRepresentsSpring === true) {
      return "SUMMER"
    }

    if (dbhSemester === "AUTUMN" && summerRepresentsAutumn === true) {
      return "SUMMER"
    }

    return dbhSemester
  }

  // For new years without an existing SUMMER grade, use NTNU as a fallback signal
  if (ntnuTaughtSemesters.length === 1) {
    const taughtSemester = ntnuTaughtSemesters[0]

    if (taughtSemester === "SPRING" && dbhSemester === "AUTUMN") {
      return "SUMMER"
    }

    if (taughtSemester === "AUTUMN" && dbhSemester === "SPRING") {
      return "SUMMER"
    }
  }

  return dbhSemester
}

type HistoricalSummerMapping = {
  summerRepresentsSpring: boolean | null
  summerRepresentsAutumn: boolean | null
}

/**
 * Tries to determine if SUMMER grades in DBH represent SPRING or AUTUMN semesters for a given course, based on existing stored grades for that course.

 * This works only because we have historical data from `Karstat`, which supported SUMMER semesters, before we switched to DBH.
 */
function getHistoricalSummerMapping(existingGradesForCourse: Grade[]): HistoricalSummerMapping {
  const years = new Set(existingGradesForCourse.map((grade) => grade.year))

  let summerRepresentsSpring: boolean | null = null
  let summerRepresentsAutumn: boolean | null = null

  for (const year of years) {
    const semesters = new Set(
      existingGradesForCourse.filter((grade) => grade.year === year).map((grade) => grade.semester)
    )

    const hasSpring = semesters.has("SPRING")
    const hasSummer = semesters.has("SUMMER")
    const hasAutumn = semesters.has("AUTUMN")

    if (!hasSummer) {
      continue
    }

    // If the year has AUTUMN and SUMMER but no SPRING, it is likely that SUMMER represents SPRING
    if (hasSpring) {
      summerRepresentsSpring = false
    } else if (hasAutumn && summerRepresentsSpring === null) {
      summerRepresentsSpring = true
    }

    // If the year has SPRING and SUMMER but no AUTUMN, it is likely that SUMMER represents AUTUMN
    if (hasAutumn) {
      summerRepresentsAutumn = false
    } else if (hasSpring && summerRepresentsAutumn === null) {
      summerRepresentsAutumn = true
    }
  }

  return {
    summerRepresentsSpring,
    summerRepresentsAutumn,
  }
}
