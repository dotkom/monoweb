import { type ColumnType } from "kysely"

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>

export type Int8 = ColumnType<string, bigint | number | string, bigint | number | string>

export type SubjectGradingSeason = "AUTUMN" | "SPRING" | "SUMMER" | "WINTER"

export type Timestamp = ColumnType<Date, Date | string, Date | string>

export interface _SqlxMigrations {
  checksum: Buffer
  description: string
  executionTime: Int8
  installedOn: Generated<Timestamp>
  success: boolean
  version: Int8
}

export interface Department {
  facultyId: string
  id: Generated<string>
  name: string
  refId: string
}

export interface Faculty {
  id: Generated<string>
  name: string
  refId: string
}

export interface Subject {
  averageGrade: Generated<number>
  credits: number
  departmentId: string
  educationalLevel: string
  failedStudents: Generated<number>
  id: Generated<string>
  instructionLanguage: string
  name: string
  refId: string
  slug: string
  totalStudents: Generated<number>
}

export interface SubjectSeasonGrade {
  gradedA: number | null
  gradedB: number | null
  gradedC: number | null
  gradedD: number | null
  gradedE: number | null
  gradedF: number | null
  gradedFail: number | null
  gradedPass: number | null
  id: Generated<string>
  season: SubjectGradingSeason
  subjectId: string
  year: number
}

export interface DB {
  _SqlxMigrations: _SqlxMigrations
  department: Department
  faculty: Faculty
  subject: Subject
  subjectSeasonGrade: SubjectSeasonGrade
}
