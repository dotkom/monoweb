import { z } from 'zod';
import type { Prisma } from '../generated';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const CourseScalarFieldEnumSchema = z.enum(['id','code','nameNo','nameEn','credits','studyLevel','gradeType','firstYearTaught','lastYearTaught','contentNo','contentEn','teachingMethodsNo','teachingMethodsEn','learningOutcomesNo','learningOutcomesEn','examTypeNo','examTypeEn','candidateCount','averageGrade','passRate','createdAt','updatedAt','taughtSemesters','teachingLanguages','campuses','facultyId','departmentId','latestYearCheckedForNtnuData']);

export const RelationLoadStrategySchema = z.enum(['query','join']);

export const GradeScalarFieldEnumSchema = z.enum(['id','gradeACount','gradeBCount','gradeCCount','gradeDCount','gradeECount','gradeFCount','passedCount','failedCount','courseId','semester','year','createdAt','updatedAt']);

export const FacultyScalarFieldEnumSchema = z.enum(['id','nameNo','nameEn','code']);

export const DepartmentScalarFieldEnumSchema = z.enum(['id','nameNo','nameEn','code','facultyId']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const SemesterSchema = z.enum(['SPRING','SUMMER','AUTUMN']);

export type SemesterType = `${z.infer<typeof SemesterSchema>}`

export const StudyLevelSchema = z.enum(['FOUNDATION','INTERMEDIATE','BACHELOR_ADVANCED','MASTER','PHD','CONTINUING_EDUCATION','UNKNOWN']);

export type StudyLevelType = `${z.infer<typeof StudyLevelSchema>}`

export const GradeTypeSchema = z.enum(['PASS_FAIL','LETTER']);

export type GradeTypeType = `${z.infer<typeof GradeTypeSchema>}`

export const CampusSchema = z.enum(['TRONDHEIM','GJOVIK','ALESUND']);

export type CampusType = `${z.infer<typeof CampusSchema>}`

export const TeachingLanguageSchema = z.enum(['NORWEGIAN','ENGLISH']);

export type TeachingLanguageType = `${z.infer<typeof TeachingLanguageSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// COURSE SCHEMA
/////////////////////////////////////////

export const CourseSchema = z.object({
  studyLevel: StudyLevelSchema,
  gradeType: GradeTypeSchema,
  taughtSemesters: SemesterSchema.array(),
  teachingLanguages: TeachingLanguageSchema.array(),
  campuses: CampusSchema.array(),
  id: z.string().uuid(),
  code: z.string(),
  nameNo: z.string(),
  nameEn: z.string().nullable(),
  credits: z.number().nullable(),
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
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  facultyId: z.string().nullable(),
  departmentId: z.string().nullable(),
  /**
   * Metadata used to speed up sync by limiting how far back the scraper has to check for changes
   */
  latestYearCheckedForNtnuData: z.number().int().nullable(),
})

export type Course = z.infer<typeof CourseSchema>

/////////////////////////////////////////
// GRADE SCHEMA
/////////////////////////////////////////

export const GradeSchema = z.object({
  semester: SemesterSchema,
  id: z.string().uuid(),
  gradeACount: z.number().int(),
  gradeBCount: z.number().int(),
  gradeCCount: z.number().int(),
  gradeDCount: z.number().int(),
  gradeECount: z.number().int(),
  gradeFCount: z.number().int(),
  passedCount: z.number().int(),
  failedCount: z.number().int(),
  courseId: z.string(),
  year: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Grade = z.infer<typeof GradeSchema>

/////////////////////////////////////////
// FACULTY SCHEMA
/////////////////////////////////////////

export const FacultySchema = z.object({
  id: z.string().uuid(),
  nameNo: z.string(),
  nameEn: z.string(),
  /**
   * DBH code for faculty, for example "230000"
   */
  code: z.number().int(),
})

export type Faculty = z.infer<typeof FacultySchema>

/////////////////////////////////////////
// DEPARTMENT SCHEMA
/////////////////////////////////////////

export const DepartmentSchema = z.object({
  id: z.string().uuid(),
  nameNo: z.string(),
  nameEn: z.string(),
  /**
   * DBH code for department, for example "230240"
   */
  code: z.number().int(),
  facultyId: z.string(),
})

export type Department = z.infer<typeof DepartmentSchema>
