import { buildAnyOfFilter, buildSearchFilter, createSortOrder } from "@dotkomonline/utils"
import z from "zod"

export const SemesterSchema = z.enum(["SPRING", "SUMMER", "AUTUMN"])
export type Semester = z.infer<typeof SemesterSchema>

export const StudyLevelSchema = z.enum([
  "FOUNDATION",
  "INTERMEDIATE",
  "BACHELOR_ADVANCED",
  "MASTER",
  "PHD",
  "CONTINUING_EDUCATION",
  "UNKNOWN",
])
export type StudyLevel = z.infer<typeof StudyLevelSchema>

export const GradeTypeSchema = z.enum(["PASS_FAIL", "LETTER"])
export type GradeType = z.infer<typeof GradeTypeSchema>

export const TeachingLanguageSchema = z.enum(["NORWEGIAN", "ENGLISH"])
export type TeachingLanguage = z.infer<typeof TeachingLanguageSchema>

export const CourseCampusSchema = z.enum(["TRONDHEIM", "GJOVIK", "ALESUND"])
export type CourseCampus = z.infer<typeof CourseCampusSchema>

export const FacultySchema = z.object({
  id: z.string(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.int(),
})
export type Faculty = z.infer<typeof FacultySchema>

export const DepartmentSchema = z.object({
  id: z.string(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.int(),
  facultyId: z.string(),
})
export type Department = z.infer<typeof DepartmentSchema>

export const CourseSchema = z.object({
  id: z.string(),
  code: z.string(),
  nameNo: z.string(),
  nameEn: z.string().nullable(),
  credits: z.number().nullable(),
  studyLevel: StudyLevelSchema,
  gradeType: GradeTypeSchema,
  firstYearTaught: z.int(),
  lastYearTaught: z.int().nullable(),
  contentNo: z.string().nullable(),
  contentEn: z.string().nullable(),
  teachingMethodsNo: z.string().nullable(),
  teachingMethodsEn: z.string().nullable(),
  learningOutcomesNo: z.string().nullable(),
  learningOutcomesEn: z.string().nullable(),
  examTypeNo: z.string().nullable(),
  examTypeEn: z.string().nullable(),
  candidateCount: z.int(),
  averageGrade: z.number(),
  passRate: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  taughtSemesters: z.array(SemesterSchema),
  teachingLanguages: z.array(TeachingLanguageSchema),
  campuses: z.array(CourseCampusSchema),
  facultyId: z.string().nullable(),
  departmentId: z.string().nullable(),
  latestYearCheckedForNtnuData: z.int().nullable(),
})

export type CourseId = Course["id"]
export type CourseCode = Course["code"]
export type Course = z.infer<typeof CourseSchema>

export const CourseWriteSchema = CourseSchema.pick({
  code: true,
  nameNo: true,
  credits: true,
  studyLevel: true,
  gradeType: true,
  firstYearTaught: true,
  lastYearTaught: true,
  candidateCount: true,
  averageGrade: true,
  passRate: true,
  taughtSemesters: true,
  campuses: true,
  teachingLanguages: true,
  contentEn: true,
  contentNo: true,
  teachingMethodsEn: true,
  teachingMethodsNo: true,
  departmentId: true,
  facultyId: true,
  examTypeEn: true,
  examTypeNo: true,
  learningOutcomesEn: true,
  learningOutcomesNo: true,
  nameEn: true,
  latestYearCheckedForNtnuData: true,
}).extend({
  facultyId: FacultySchema.shape.id.optional(),
  departmentId: DepartmentSchema.shape.id.optional(),
})
export type CourseWrite = z.infer<typeof CourseWriteSchema>

export const CourseListItemSchema = CourseSchema.pick({
  id: true,
  code: true,
  nameNo: true,
  nameEn: true,
  credits: true,
  studyLevel: true,
  gradeType: true,
  lastYearTaught: true,
  candidateCount: true,
  averageGrade: true,
  passRate: true,
  taughtSemesters: true,
  teachingLanguages: true,
  campuses: true,
})
export type CourseListItem = z.infer<typeof CourseListItemSchema>

export const CourseAliasSchema = z.object({
  alias: z.string(),
  useForSEO: z.boolean(),
})
export type CourseAlias = z.infer<typeof CourseAliasSchema>

export type CourseFilterSort = z.infer<typeof CourseFilterSortSchema>
export const CourseFilterSortSchema = z.enum(["AVERAGE_GRADE", "PASS_RATE", "CANDIDATE_COUNT"])

export const MinLetterGradeFilterSchema = z.enum(["A", "B", "C", "D", "E"])
export type MinLetterGradeFilter = z.infer<typeof MinLetterGradeFilterSchema>

export type CourseFilterQuery = z.infer<typeof CourseFilterQuerySchema>
export const CourseFilterQuerySchema = z
  .object({
    bySearch: buildSearchFilter(),
    orderBy: createSortOrder(),
    sortBy: buildAnyOfFilter(CourseFilterSortSchema),
    bySemester: buildAnyOfFilter(SemesterSchema),
    byTeachingLanguage: buildAnyOfFilter(TeachingLanguageSchema),
    byCampus: buildAnyOfFilter(CourseCampusSchema),
    byMinGrade: MinLetterGradeFilterSchema.nullish(),
  })
  .partial()

export type SemesterKey = { year: number; semester: Semester }

export type SerializedSemesterKey = `${number}-${Semester}`

export const CourseSitemapEntrySchema = CourseSchema.pick({
  code: true,
  updatedAt: true,
})
export type CourseSitemapEntry = z.infer<typeof CourseSitemapEntrySchema>

export const mapAverageGradeToLetterGrade = (averageGrade: Course["averageGrade"]) => {
  const roundedAverage = Math.round(averageGrade)

  switch (roundedAverage) {
    case 5:
      return "A"
    case 4:
      return "B"
    case 3:
      return "C"
    case 2:
      return "D"
    case 1:
      return "E"
    case 0:
      return "F"
  }
}

export const mapLetterGradeFilterToMinAverageGrade = (minGrade: MinLetterGradeFilter): number => {
  switch (minGrade) {
    case "A":
      return 4.5
    case "B":
      return 3.5
    case "C":
      return 2.5
    case "D":
      return 1.5
    case "E":
      return 0.5
  }
}

export type Locale = "no" | "en"

export function pickLocalized(locale: Locale, no: string | null, en: string | null): string | null {
  const preferred = locale === "en" ? en : no
  const fallback = locale === "en" ? no : en

  return preferred || fallback || null
}

export const getCourseLocalizedName = (course: Course | CourseListItem, locale: Locale) => {
  return pickLocalized(locale, course.nameNo, course.nameEn) ?? course.nameNo
}

export const getCourseLocalizedTextFields = (course: Course, locale: Locale) => ({
  name: getCourseLocalizedName(course, locale),
  content: pickLocalized(locale, course.contentNo, course.contentEn),
  learningOutcomes: pickLocalized(locale, course.learningOutcomesNo, course.learningOutcomesEn),
  teachingMethods: pickLocalized(locale, course.teachingMethodsNo, course.teachingMethodsEn),
  examType: pickLocalized(locale, course.examTypeNo, course.examTypeEn),
})

export function serializeSemesterKey({ year, semester }: SemesterKey): SerializedSemesterKey {
  return `${year}-${semester}`
}

export function parseSemesterKey(value: string): SemesterKey | null {
  const [yearStr, semesterStr] = value.split("-")
  const year = Number(yearStr)
  const semester = SemesterSchema.safeParse(semesterStr)

  if (!Number.isInteger(year) || !semester.success) {
    return null
  }

  return { year, semester: semester.data }
}
