import { type ColumnType } from "kysely"

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>

export type SubjectSeason = "AUTUMN" | "SPRING" | "SUMMER" | "WINTER"

export type SubjectWriteLogGrade = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H"

export type Timestamp = ColumnType<Date, Date | string, Date | string>

export interface NtnuFaculty {
  id: Generated<string>
  name: string
  refId: string
}

export interface NtnuFacultyDepartment {
  facultyId: string
  id: Generated<string>
  name: string
  refId: string
}

export interface Subject {
  credits: number
  departmentId: string
  educationalLevel: string
  id: Generated<string>
  instructionLanguage: string
  name: string
  refId: string
  slug: string
}

export interface SubjectSeasonGrade {
  grade: number
  gradedA: number | null
  gradedB: number | null
  gradedC: number | null
  gradedD: number | null
  gradedE: number | null
  gradedF: number | null
  gradedFail: number | null
  gradedPass: number | null
  id: Generated<string>
  season: SubjectSeason
  subjectId: string
  year: number
}

export interface SubjectSeasonGradeWriteLog {
  createdAt: Generated<Timestamp>
  grade: SubjectWriteLogGrade
  id: Generated<string>
  season: SubjectSeason
  subjectId: string
  year: number
}

export interface DB {
  ntnuFaculty: NtnuFaculty
  ntnuFacultyDepartment: NtnuFacultyDepartment
  subject: Subject
  subjectSeasonGrade: SubjectSeasonGrade
  subjectSeasonGradeWriteLog: SubjectSeasonGradeWriteLog
}
