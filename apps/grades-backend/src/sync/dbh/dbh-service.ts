import * as z from "zod"
import { filterSchema, institutionFilter, taskFilter } from "./dbh-filters"
import {
  DbhCourseRecordSchema,
  DbhSemesterGradeSchema,
  type DbhSemesterGrade,
  type ParsedDbhSemesterGrade,
} from "./dbh-types"

/*
API documentation can be found at:
https://dbh.hkdir.no/static/files/dokumenter/api/api_dokumentasjon.pdf

Or table documentation found at:
https://dbh.hkdir.no/datainnhold/tabell-dokumentasjon
*/

export const getAllGrades = async (): Promise<DbhSemesterGrade[]> => {
  const grades = await fetchAllGrades()

  const parsedGrades = z.array(DbhSemesterGradeSchema).parse(grades)
  return parsedGrades.filter(isValidGrade)
}

export const getAllCourseRecords = async () => {
  const courses = await fetchAllCourses()

  return z.array(DbhCourseRecordSchema).parse(courses)
}

const BASE_URL = "https://dbh.hkdir.no"
const TABLE_BASE_URL = `${BASE_URL}/api/Tabeller/hentJSONTabellData`

const API_VERSION = 1
const STATUS_LINE = false // Should extra information about the API response be included?
const CODE_TEXT = true // Should names of related resources be included?
const DECIMAL_SEPERATOR = "."

const QuerySchema = z.object({
  tabell_id: z.number(),
  api_versjon: z.number().default(API_VERSION),
  statuslinje: z.string().default(STATUS_LINE ? "J" : "N"),
  kodetekst: z.string().default(CODE_TEXT ? "J" : "N"),
  desimal_seperator: z.string().default(DECIMAL_SEPERATOR),
  sortBy: z.array(z.string()).default([]),
  variabler: z.array(z.string()).default(["*"]).optional(),
  filter: z.array(filterSchema).default([]),
  groupBy: z.array(z.string()).optional(),
  begrensning: z.coerce.string().optional(),
})

const fetchData = async (
  dataSource: "course" | "grade",
  sortBy: string[],
  options?: {
    groupBy?: string[]
    filters?: z.infer<typeof filterSchema>[]
  }
) => {
  const tableId = dataSource === "course" ? 208 : 308

  // Grades table doesn't accept "variabler" parameter
  const variables = dataSource === "course" ? ["*"] : undefined

  const query = QuerySchema.parse({
    tabell_id: tableId,
    sortBy,
    ...(options?.filters !== undefined ? { filter: options.filters } : {}),
    ...(options?.groupBy !== undefined ? { groupBy: options.groupBy } : {}),
    variabler: variables,
  })

  const res = await fetch(TABLE_BASE_URL, {
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
  const groupBy = ["Institusjonskode", "Emnekode", "Karakter", "Årstall", "Semester", "Avdelingskode"]
  const sortBy = ["Emnekode", "Årstall", "Semester"]
  const filters = [institutionFilter]

  return fetchData("grade", sortBy, { groupBy, filters })
}

const fetchAllCourses = async () => {
  const sortBy = ["Emnekode", "Årstall", "Semester"]
  const filters = [institutionFilter, taskFilter]

  return fetchData("course", sortBy, { filters })
}

function isValidGrade(grade: ParsedDbhSemesterGrade): grade is DbhSemesterGrade {
  if (grade.semester === null) {
    return false
  }

  if (grade.grade === "BLANK" || grade.grade === "ABSENT") {
    return false
  }

  return true
}

/**
 * Removes versioning from DBH course codes, e.g. "TDT4100-1" becomes "TDT4100"
 */
export function normalizeDbhCourseCode(code: string) {
  const lastDashIndex = code.lastIndexOf("-")
  if (lastDashIndex === -1) {
    return code
  }

  return code.slice(0, lastDashIndex)
}
