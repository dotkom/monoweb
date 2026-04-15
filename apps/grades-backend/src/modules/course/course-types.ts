import { schemas } from "@dotkomonline/grades-db/schemas"
import { buildSearchFilter, buildAnyOfFilter, createSortOrder } from "@dotkomonline/types"
import z from "zod"

export const CourseSchema = schemas.CourseSchema.extend({})

export type CourseId = Course["id"]
export type CourseCode = Course["code"]
export type Course = z.infer<typeof CourseSchema>

export type CourseWrite = z.infer<typeof CourseSchema>

export type CourseFilterSort = z.infer<typeof CourseFilterSortSchema>
export const CourseFilterSortSchema = z.enum(["AVERAGE_GRADE", "PASS_RATE", "STUDENT_COUNT"])
export type CourseFilterQuery = z.infer<typeof CourseFilterQuerySchema>
export const CourseFilterQuerySchema = z
  .object({
    byCode: buildSearchFilter(),
    byName: buildSearchFilter(),
    orderBy: createSortOrder(),
    sortBy: buildAnyOfFilter(CourseFilterSortSchema),
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

export const mapCourseSemesterToLabel = (semester: Semester) => {
  switch (semester) {
    case "FALL":
      return "Høst"
    case "SPRING":
      return "Vår"
    case "SUMMER":
      return "Sommer"
  }
}

export const mapCourseStudyLevelToLabel = (studyLevel: Course["studyLevel"]) => {
  switch (studyLevel) {
    case "BACHELOR_ADVANCED":
      return "Bachelor (avansert)"
    case "CONTINUING_EDUCATION":
      return "Videreutdanning"
    case "FOUNDATION":
      return "Grunnkurs"
    case "INTERMEDIATE":
      return "Mellomnivå"
    case "MASTER":
      return "Master"
    case "PHD":
      return "PhD"
    case "UNKNOWN":
      return "Ukjent"
  }
}

export const mapCourseCampusToLabel = (campus: CourseCampus) => {
  switch (campus) {
    case "TRONDHEIM":
      return "Trondheim"
    case "ALESUND":
      return "Ålesund"
    case "GJOVIK":
      return "Gjøvik"
  }
}

export const mapTaughtLanguageToShortLabel = (language: Course["teachingLanguages"][number]) => {
  switch (language) {
    case "NORWEGIAN":
      return "NO"
    case "ENGLISH":
      return "EN"
  }
}

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
