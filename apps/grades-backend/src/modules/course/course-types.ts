import { schemas } from "@dotkomonline/grades-db/schemas"
import { buildAnyOfFilter, buildSearchFilter, createSortOrder } from "@dotkomonline/types"
import z from "zod"

export const CourseSchema = schemas.CourseSchema.extend({})

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
  facultyId: schemas.FacultySchema.shape.id.optional(),
  departmentId: schemas.DepartmentSchema.shape.id.optional(),
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
    bySemester: buildAnyOfFilter(schemas.SemesterSchema),
    byTeachingLanguage: buildAnyOfFilter(schemas.TeachingLanguageSchema),
    byCampus: buildAnyOfFilter(schemas.CampusSchema),
    byMinGrade: MinLetterGradeFilterSchema.nullish(),
  })
  .partial()

export const SemesterSchema = schemas.SemesterSchema
export type Semester = z.infer<typeof SemesterSchema>

export const FacultySchema = schemas.FacultySchema.extend({})
export type Faculty = z.infer<typeof FacultySchema>

export const DepartmentSchema = schemas.DepartmentSchema.extend({})
export type Department = z.infer<typeof DepartmentSchema>

export const StudyLevelSchema = schemas.StudyLevelSchema
export type StudyLevel = z.infer<typeof StudyLevelSchema>

export const GradeTypeSchema = schemas.GradeTypeSchema
export type GradeType = z.infer<typeof GradeTypeSchema>

export const CourseCampusSchema = schemas.CampusSchema
export type CourseCampus = z.infer<typeof CourseCampusSchema>

export const TeachingLanguageSchema = schemas.TeachingLanguageSchema
export type TeachingLanguage = z.infer<typeof TeachingLanguageSchema>

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
