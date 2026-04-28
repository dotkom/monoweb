import type { DBClient, TeachingLanguage } from "@dotkomonline/grades-db"
import fsp from "node:fs/promises"
import path from "node:path"
import { z } from "zod"
import { createConfiguration } from "../configuration"
import { createServiceLayer, createThirdPartyClients } from "../modules/core"

import {
  SemesterSchema,
  type Course,
  type CourseWrite,
  type Department,
  type Faculty,
  type GradeType,
  type Semester,
  type StudyLevel,
} from "../modules/course/course-types"
import type { GradeWrite } from "../modules/grade/grade-types"

// To run the script, run the commented SQL queries and copy the contents to new json files in `./scripts`

const pathOfThisScript = import.meta.dirname

const configuration = createConfiguration()
const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies)
const prisma = serviceLayer.prisma

const faculties = await migrateFaculties(prisma)
const departments = await migrateDepartments(prisma, faculties)

const courses = await migrateCourses(prisma, faculties, departments)

await migrateGrades(prisma, courses)

/**
 * faculties.json
 * 
 * select
   jsonb_pretty(coalesce(jsonb_agg(t), '[]'::jsonb)) as faculties_json
   from
     (
       select
         norwegian_name as name_no,
         english_name as name_en,
         REPLACE(nsd_code, '1150', '') as code
       from
         grades_faculty
     ) as t;
 */
async function migrateFaculties(prisma: DBClient) {
  const OldGradesFacultySchema = z.object({
    name_no: z.string(),
    name_en: z.string(),
    code: z.coerce.number(),
  })

  const rawFaculties = await fsp.readFile(path.resolve(pathOfThisScript, "./faculties.json"), "utf-8")
  const oldGradesFaculties = OldGradesFacultySchema.array().parse(JSON.parse(rawFaculties))

  return prisma.faculty.createManyAndReturn({
    data: oldGradesFaculties.map((faculty) => ({
      code: faculty.code,
      nameNo: faculty.name_no,
      nameEn: faculty.name_en,
    })),
  })
}

/**
 * departments.json
 * 
 * select
   jsonb_pretty(coalesce(jsonb_agg(t), '[]'::jsonb)) as departments_json
   from
     (
       select
         grades_department.norwegian_name as name_no,
         grades_department.english_name as name_en,
         REPLACE(grades_department.nsd_code, '1150', '') as code,
         REPLACE(grades_faculty.nsd_code, '1150', '') as faculty_code
       from
         grades_department
         left join grades_faculty on grades_faculty.id = grades_department.faculty_id
     ) as t;
 */
async function migrateDepartments(prisma: DBClient, faculties: Faculty[]) {
  const OldGradesDepartmentSchema = z.object({
    name_no: z.string(),
    name_en: z.string(),
    code: z.coerce.number(),
    faculty_code: z.coerce.number().nullable(),
  })

  const rawDepartments = await fsp.readFile(path.resolve(pathOfThisScript, "./departments.json"), "utf-8")
  const oldGradesDepartments = OldGradesDepartmentSchema.array().parse(JSON.parse(rawDepartments))

  const facultyByCode = faculties.reduce(
    (acc, faculty) => {
      acc[faculty.code] = faculty
      return acc
    },
    {} as Record<string, Faculty>
  )

  const data = oldGradesDepartments
    .filter((d) => d.faculty_code !== null)
    .filter((d) => d.code !== 220530) // This department is duplicated and doesn't have any attached courses, so we don't need to sync it
    .map((department) => ({
      code: department.code,
      nameNo: department.name_no,
      nameEn: department.name_en,
      facultyId: facultyByCode[String(department.faculty_code)]?.id,
    }))

  return prisma.department.createManyAndReturn({
    data,
  })
}

/**
 * courses.json
 * 
 * select jsonb_pretty(coalesce(jsonb_agg(t), '[]'::jsonb)) as courses_json
   from (
   select
     grades_course.norwegian_name as name_no,
     grades_course.english_name as name_en,
     code,
     REPLACE(grades_faculty.nsd_code, '1150', '') as faculty_code,
     REPLACE(grades_department.nsd_code, '1150', '') as department_code,
     credit as credits,
     study_level,
     taught_in_spring,
     taught_in_autumn,
     taught_from,
     last_year_taught,
     taught_in_english,
     content as content_no,
     learning_form as learning_methods,
     learning_goal,
     exam_type as exam_type_no,
     grade_type,
     place,
     attendee_count,
     average
   from
     grades_course
     left join grades_faculty on grades_faculty.faculty_id = grades_course.faculty_code
     left join grades_department on grades_department.id = grades_course.department_id
   ) as t;
 */
async function migrateCourses(prisma: DBClient, faculties: Faculty[], departments: Department[]) {
  const OldGradesCourseSchema = z.object({
    name_no: z.string(),
    name_en: z.string(),
    code: z.string(),
    faculty_code: z.coerce.number().nullable(),
    department_code: z.coerce.number().nullable(),
    credits: z.number(),
    study_level: z.number(),

    taught_in_spring: z.boolean(),
    taught_in_autumn: z.boolean(),
    taught_from: z.number().int().nullable(),
    last_year_taught: z.number().int().nullable(),
    taught_in_english: z.boolean(),

    content_no: z.string().nullable(),
    learning_methods: z.string().nullable(),
    learning_goal: z.string().nullable(),
    exam_type_no: z.string().nullable(),
    grade_type: z.string().nullable(),
    place: z.string().nullable(),

    attendee_count: z.number().int().nullable(),
    average: z.number().nullable(),
  })

  const rawCourses = await fsp.readFile(path.resolve(pathOfThisScript, "./courses.json"), "utf-8")
  const oldGradesCourses = OldGradesCourseSchema.array().parse(JSON.parse(rawCourses))

  const facultyByCode = faculties.reduce(
    (acc, faculty) => {
      acc[faculty.code] = faculty
      return acc
    },
    {} as Record<string, Faculty>
  )

  const departmentByCode = departments.reduce(
    (acc, department) => {
      acc[department.code] = department
      return acc
    },
    {} as Record<string, Department>
  )

  const data: CourseWrite[] = oldGradesCourses.map((course) => {
    const taughtSemesters: Array<Semester> = []
    if (course.taught_in_spring) {
      taughtSemesters.push("SPRING")
    }
    if (course.taught_in_autumn) {
      taughtSemesters.push("AUTUMN")
    }

    const teachingLanguages: Array<TeachingLanguage> = []
    if (course.taught_in_english) {
      teachingLanguages.push("ENGLISH")
    } else {
      teachingLanguages.push("NORWEGIAN")
    }

    let studyLevel: StudyLevel = "UNKNOWN"
    switch (course.study_level) {
      case 900:
        studyLevel = "PHD"
        break
      case 850:
      case 800:
        studyLevel = "CONTINUING_EDUCATION"
        break
      case 500:
      case 400:
      case 350:
        studyLevel = "MASTER"
        break
      case 300:
        studyLevel = "BACHELOR_ADVANCED"
        break
      case 200:
        studyLevel = "INTERMEDIATE"
        break
      case 100:
      case 90:
      case 80:
      case 71:
      case 70:
      case 60:
      case 50:
        studyLevel = "FOUNDATION"
        break
      case 0:
      case -1:
        studyLevel = "UNKNOWN"
        break
      default:
        throw new Error(`Unknown study level ${course.study_level} for course ${course.code}`)
    }

    const gradeType: GradeType = course.grade_type?.toLowerCase().includes("bokstav") ? "LETTER" : "PASS_FAIL"

    const courseWrite: CourseWrite = {
      code: course.code,
      nameNo: course.name_no,
      nameEn: course.name_en,
      facultyId: facultyByCode[String(course.faculty_code)]?.id,
      departmentId: departmentByCode[String(course.department_code)]?.id,
      credits: course.credits,
      studyLevel: studyLevel,
      firstYearTaught: course.taught_from ?? new Date().getFullYear(),
      lastYearTaught: course.last_year_taught,
      taughtSemesters,
      teachingLanguages,
      contentNo: course.content_no,
      contentEn: null,
      teachingMethodsNo: course.learning_methods,
      teachingMethodsEn: null,
      learningOutcomesNo: course.learning_goal,
      learningOutcomesEn: null,
      examTypeNo: course.exam_type_no,
      examTypeEn: null,
      gradeType: gradeType,
      campuses: ["TRONDHEIM"],
      candidateCount: course.attendee_count ?? 0,
      averageGrade: course.average ?? 0,
      passRate: 0,
      latestYearCheckedForNtnuData: null,
    }

    return courseWrite
  })

  return prisma.course.createManyAndReturn({
    data,
  })
}

/**
 * grades.json
 * 
 * select
   jsonb_pretty(coalesce(jsonb_agg(t), '[]'::jsonb)) as grades_json
   from
     (
       select
         average_grade,
         passed,
         a,
         b,
         c,
         d,
         e,
         f,
         semester,
         year,
         grades_course.code as course_code
       from
         grades_grade
         left join grades_course on grades_course.id = grades_grade.course_id
     ) as t;
 */
async function migrateGrades(prisma: DBClient, courses: Course[]) {
  const OldGradesGradeSchema = z.object({
    average_grade: z.number(),
    passed: z.number(),
    a: z.number(),
    b: z.number(),
    c: z.number(),
    d: z.number(),
    e: z.number(),
    f: z.number(),
    semester: SemesterSchema,
    year: z.number(),
    course_code: z.string(),
  })

  const rawGrades = await fsp.readFile(path.resolve(pathOfThisScript, "./grades.json"), "utf-8")
  const oldGrades = OldGradesGradeSchema.array().parse(JSON.parse(rawGrades))

  const courseByCode = courses.reduce(
    (acc, course) => {
      acc[course.code] = course
      return acc
    },
    {} as Record<string, Course>
  )

  const data: GradeWrite[] = oldGrades.map((grade) => {
    const course = courseByCode[grade.course_code]
    if (!course) {
      throw new Error(`Course not found for code ${grade.course_code}`)
    }

    let gradeFCount = 0
    let failedCount = 0

    if (grade.average_grade > 0) {
      gradeFCount = grade.f
      failedCount = 0
    } else {
      gradeFCount = 0
      failedCount = grade.f
    }

    const gradeWrite: GradeWrite = {
      courseId: course.id,
      semester: grade.semester,
      year: grade.year,
      gradeACount: grade.a,
      gradeBCount: grade.b,
      gradeCCount: grade.c,
      gradeDCount: grade.d,
      gradeECount: grade.e,
      passedCount: grade.passed,
      gradeFCount,
      failedCount,
    }

    return gradeWrite
  })

  return prisma.grade.createManyAndReturn({
    data,
  })
}
