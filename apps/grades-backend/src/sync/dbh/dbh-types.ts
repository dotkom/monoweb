import { z } from "zod"
import type { Semester } from "../../modules/course/course-types"
import {
  DbhOrgUnitCodeSchema,
  parseGradeString,
  parseSemester,
  parseStatus,
  parseStudyLevel,
  parseTeachingLanguage,
} from "./dbh-parsers"
import { normalizeDbhCourseCode } from "./dbh-service"

export const DbhCourseStatusSchema = z.enum(["ACTIVE", "NEW", "DISCONTINUED"])
export type DbhCourseStatus = z.infer<typeof DbhCourseStatusSchema>

export const DbhSemesterResultGradeSchema = z.enum([
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "PASSED",
  "FAILED",
  "BLANK",
  "ABSENT",
])
export type DbhSemesterResultGradeSchema = z.infer<typeof DbhSemesterResultGradeSchema>

// Table field information avaiable at
// https://dbh.hkdir.no/datainnhold/tabell-dokumentasjon/208
const ApiCourseSchema = z.object({
  Avdelingskode: z.coerce.number(),
  Årstall: z.coerce.number(),
  Semester: z.coerce.number(),
  Emnekode: z.coerce.string(),
  Emnenavn: z.coerce.string(),
  Nivåkode: z.coerce.string(), // Is sometimes a number for old timey courses where level is null
  Studiepoeng: z.coerce.number(),
  Status: z.coerce.number(),
  "Underv.språk": z.coerce.string(),
})

export const DbhCourseRecordSchema = ApiCourseSchema.transform((input) => {
  return {
    year: input.Årstall,
    semester: parseSemester(input.Semester),
    code: normalizeDbhCourseCode(input.Emnekode),
    nameNo: input.Emnenavn,
    studyLevel: parseStudyLevel(input.Nivåkode),
    teachingLanguage: parseTeachingLanguage(input["Underv.språk"]),
    status: parseStatus(input.Status),
    facultyCode: DbhOrgUnitCodeSchema.parse(input.Avdelingskode),
    departmentCode: DbhOrgUnitCodeSchema.parse(input.Avdelingskode),
    credits: input.Studiepoeng,
  }
})

export type DbhCourseRecord = z.infer<typeof DbhCourseRecordSchema>

// Table field information avaiable at
// https://dbh.hkdir.no/datainnhold/tabell-dokumentasjon/308
const ApiGradeSchema = z.object({
  Emnekode: z.coerce.string(),
  Karakter: z.coerce.string(),
  Årstall: z.coerce.number(),
  Semester: z.coerce.number(),
  Avdelingskode: z.coerce.number(),
  "Antall kandidater totalt": z.coerce.number(),
})

export const DbhSemesterGradeSchema = ApiGradeSchema.transform((input) => {
  return {
    code: normalizeDbhCourseCode(input.Emnekode),
    year: input.Årstall,
    grade: parseGradeString(input.Karakter),
    semester: parseSemester(input.Semester),
    count: input["Antall kandidater totalt"],
  }
})

export type ParsedDbhSemesterGrade = z.infer<typeof DbhSemesterGradeSchema>

export type DbhSemesterGrade = Omit<ParsedDbhSemesterGrade, "semester" | "grade"> & {
  semester: Semester
  grade: Exclude<DbhSemesterResultGradeSchema, "BLANK" | "ABSENT">
}
