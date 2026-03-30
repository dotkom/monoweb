import * as z from "zod"
import { filterSchema, institutionFilter, taskFilter } from "./filters"
import { schemas } from "@dotkomonline/grades-db/schemas"

const BASE_URL = "https://dbh.hkdir.no"
const TABLE_URL = `${BASE_URL}/api/Tabeller/hentJSONTabellData`

const API_VERSION = 1
const STATUS_LINE = false // Should extra information about the API response be included?
const CODE_TEXT = true // Should names of related resources be included?
const DECIMAL_SEPERATOR = "."

const Semesters = schemas.SemesterSchema.enum
const StudyLevels = schemas.StudyLevelSchema.enum
const TeachingLanguages = schemas.TeachingLanguageSchema.enum
const CourseStatus = z.enum(["ACTIVE", "NEW", "DISCONTINUED"])

const parseSemester = (semester: number) => {
  switch (semester) {
    case 1:
      return Semesters.SPRING
    case 2:
      return Semesters.SUMMER
    case 3:
      return Semesters.FALL
    default:
      return null
  }
}

const parseStudyLevel = (level: string) => {
  switch (level) {
    case "LN": // DBH does not differentiate between bachelor level courses, we assume foundation as fallback
      return StudyLevels.FOUNDATION
    case "HN":
      return StudyLevels.MASTER
    case "FU":
      return StudyLevels.PHD
    case "VS":
      return StudyLevels.CONTINUING_EDUCATION //???? Not sure if forkurs maps to continuing education
    default:
      return StudyLevels.UNKNOWN
  }
}

const parseTeachingLanguage = (language: string) => {
  switch (language) {
    case "NOR":
      return [TeachingLanguages.NORWEGIAN]
    case "ENG":
      return [TeachingLanguages.ENGLISH]
    default:
      return []
  }
}

const parseStatus = (status: number) => {
  switch (status) {
    case 1:
      return CourseStatus.Enum.ACTIVE
    case 2:
      return CourseStatus.Enum.NEW
    case 3:
    case 4:
      return CourseStatus.Enum.DISCONTINUED
    default:
      return null
  }
}

const ApiGradeSchema = z.object({
  Instutisjonskode: z.coerce.number(),
  Instutisjonsnavn: z.coerce.string(),
  Emnekode: z.coerce.string(),
  Karakter: z.coerce.string(),
  Årstall: z.coerce.number(),
  Semester: z.coerce.number(),
  Semesternavn: z.coerce.string(),
  Avdelingskode: z.coerce.number(),
  Avdelingsnavn: z.coerce.string(),
  "Antall kandidater totalt": z.coerce.number(),
  "Antall kandidater kvinner": z.coerce.number(),
  "Antall kandidater menn": z.coerce.number()
})
const ParsedGradeSchema = ApiGradeSchema.transform((input) => {
  return {
    code: input.Emnekode,
    year: input.Årstall,
    grade: input.Karakter,
    semester: parseSemester(input.Semester),
    count: input["Antall kandidater totalt"],
  }
})

const ApiCourseSchema = z.object({
  Instutisjonskode: z.coerce.number(),
  Instutisjonsnavn: z.coerce.string(),
  Avdelingskode: z.coerce.number(),
  Avdelingsnavn: z.coerce.string(),
  Avdelingskode_SSB: z.coerce.number().nullable(),
  Årstall: z.coerce.number(),
  Semester: z.coerce.number(),
  Semesternavn: z.coerce.string(),
  Studieprogramkode: z.coerce.string(),
  Studieprogramnavn: z.coerce.string(),
  Emnekode: z.coerce.string(),
  Emnenavn: z.coerce.string(),
  Nivåkode: z.coerce.string(), // Is sometimes a number for old timey courses where level is null
  Nivånavn: z.coerce.string().nullable(),
  Studiepoeng: z.coerce.number(),
  "NUS-kode": z.coerce.number(),
  Status: z.coerce.number(),
  Statusnavn: z.coerce.string(),
  "Underv.språk": z.coerce.string(),
  Navn: z.coerce.string(), // wtf is the difference between emnenavn and just navn????
  Fagkode: z.coerce.number().nullable(), // wtf is the difference between emnekode and fagkode
  Fagnavn: z.coerce.string().nullable(), // oh great, another name
  "Oppgave (ny fra h2012)": z.coerce.number(), // Always 0 with the taskFilter
})
const ParsedCourseSchema = ApiCourseSchema.transform((input) => {
  return {
    year: input.Årstall,
    semester: parseSemester(input.Semester),
    code: input.Emnekode.split("-")[0], // DBH has versioning in their course codes, this ensures only the actual course code remains
    norwegianName: input.Emnenavn,
    studyLevel: parseStudyLevel(input.Nivåkode),
    teachingLanguges: parseTeachingLanguage(input["Underv.språk"]),
    status: parseStatus(input.Status),
  }
})

const QuerySchema = z.object({
  tabell_id: z.number(),
  api_versjon: z.number().default(API_VERSION),
  statuslinje: z.string().default(STATUS_LINE ? "J" : "N"),
  kodetekst: z.string().default(CODE_TEXT ? "J" : "N"),
  desimal_seperator: z.string().default(DECIMAL_SEPERATOR),
  sortBy: z.array(z.string()).default([]),
  variabler: z.array(z.string()).default(["*"]),
  filter: z.array(filterSchema).default([]),
  groupBy: z.array(z.string()).optional(),
  begrensning: z.coerce.string().optional(),
})

const fetchData = async (
  tableId: number,
  sortBy: string[],
  options?: {
    groupBy?: string[]
    filters?: z.infer<typeof filterSchema>[]
  }
) => {
  const query = QuerySchema.parse({
    tabell_id: tableId,
    sortBy,
    ...(options?.filters !== undefined ? { filter: options.filters } : {}),
    ...(options?.groupBy !== undefined ? { groupBy: options.groupBy } : {}),
  })

  const res = await fetch(TABLE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  })

  if (res.status === 204) {
    return []
  }

  return await res.json()
}

const fetchAllGrades = () => {
  const tableId = 308

  const groupBy = ["Institusjonskode", "Emnekode", "Karakter", "Årstall", "Semester", "Avdelingskode"]
  const sortBy = ["Emnekode", "Årstall", "Semester"]
  const filters = [institutionFilter]

  return fetchData(tableId, sortBy, { groupBy, filters })
}

export const getAllGrades = async () => {
  const grades = await fetchAllGrades()

  return z.array(ParsedGradeSchema).parse(grades)
}

const fetchAllCourses = async () => {
  const tableId = 208

  const sortBy = ["Emnekode", "Årstall", "Semester"]
  const filters = [institutionFilter, taskFilter]

  return fetchData(tableId, sortBy, { filters })
}

export const getAllCourses = async () => {
  const courses = await fetchAllCourses()

  return z.array(ParsedCourseSchema).parse(courses)
}
