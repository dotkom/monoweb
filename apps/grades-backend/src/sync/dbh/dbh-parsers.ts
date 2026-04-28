import type { Semester, StudyLevel, TeachingLanguage } from "@dotkomonline/grades-db"
import { z } from "zod"
import { NTNU_DBH_INSTITUTION_ID } from "./dbh-filters"
import type { DbhCourseStatus, DbhSemesterResultGradeSchema } from "./dbh-types"

export const parseGradeString = (grade: string): DbhSemesterResultGradeSchema => {
  switch (grade) {
    case "A":
      return "A"
    case "B":
      return "B"
    case "C":
      return "C"
    case "D":
      return "D"
    case "E":
      return "E"
    case "F":
      return "F"
    case "G":
      return "PASSED"
    case "H":
      return "FAILED"
    case "T":
      return "BLANK"
    case "X":
      return "ABSENT"
    default:
      throw new Error(`Unknown grade: ${grade}`)
  }
}

export const parseSemester = (semester: number): Semester | null => {
  switch (semester) {
    case 1:
      return "SPRING"
    case 2:
      return "SUMMER"
    case 3:
      return "AUTUMN"
    default:
      return null
  }
}

export const parseStudyLevel = (level: string): StudyLevel => {
  switch (level) {
    case "LN":
      return "FOUNDATION"
    case "HN":
      return "MASTER"
    case "FU":
      return "PHD"
    case "VS":
      return "FOUNDATION"
    default:
      return "UNKNOWN"
  }
}

export const parseTeachingLanguage = (language: string): TeachingLanguage | null => {
  switch (language) {
    case "NOR":
      return "NORWEGIAN"
    case "ENG":
      return "ENGLISH"
    default:
      return null
  }
}

export const parseStatus = (status: number): DbhCourseStatus | null => {
  switch (status) {
    case 1:
      return "ACTIVE"
    case 2:
      return "NEW"
    case 3:
    case 4:
      return "DISCONTINUED"
    default:
      return null
  }
}

export const parseFacultyOrDepartmentCode = (code: number) => {
  const institutionPrefix = NTNU_DBH_INSTITUTION_ID.toString()
  const codeStr = code.toString()
  const codeStrWithoutInstitutionId = codeStr.replace(institutionPrefix, "")

  return Number(codeStrWithoutInstitutionId)
}

export const DbhOrgUnitCodeSchema = z.union([z.string(), z.number()]).transform((val) => {
  const prefix = NTNU_DBH_INSTITUTION_ID.toString()
  const str = val.toString()

  const cleaned = str.startsWith(prefix) ? str.slice(prefix.length) : str

  return Number(cleaned)
})
