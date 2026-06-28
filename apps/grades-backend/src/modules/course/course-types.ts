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
  code: z.number().int(),
})
export type Faculty = z.infer<typeof FacultySchema>

export const DepartmentSchema = z.object({
  id: z.string(),
  nameNo: z.string(),
  nameEn: z.string(),
  code: z.number().int(),
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
  firstYearTaught: z.number().int(),
  lastYearTaught: z.number().int().nullable(),
  contentNo: z.string().nullable(),
  contentEn: z.string().nullable(),
  teachingMethodsNo: z.string().nullable(),
  teachingMethodsEn: z.string().nullable(),
  learningOutcomesNo: z.string().nullable(),
  learningOutcomesEn: z.string().nullable(),
  examTypeNo: z.string().nullable(),
  examTypeEn: z.string().nullable(),
  candidateCount: z.number().int(),
  averageGrade: z.number(),
  passRate: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  taughtSemesters: z.array(SemesterSchema),
  teachingLanguages: z.array(TeachingLanguageSchema),
  campuses: z.array(CourseCampusSchema),
  facultyId: z.string().nullable(),
  departmentId: z.string().nullable(),
  latestYearCheckedForNtnuData: z.number().int().nullable(),
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

export const getCourseName = (course: Course, locale: "no" | "en") => {
  if (locale === "en" && course.nameEn !== null) {
    return course.nameEn
  }

  return course.nameNo
}
