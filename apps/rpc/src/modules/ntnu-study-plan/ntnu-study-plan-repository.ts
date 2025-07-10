import { getLogger } from "@dotkomonline/logger"
import { z } from "zod"

const BaseStudyWaypointSchema = z.object({
  code: z.string(),
  name: z.string(),
})

type StudyWaypoint = z.infer<typeof BaseStudyWaypointSchema> & {
  studyDirections: z.infer<typeof StudyDirectionSchema>[]
}

const StudyWaypointSchema: z.ZodType<StudyWaypoint> = BaseStudyWaypointSchema.extend({
  studyDirections: z.lazy(() => z.array(StudyDirectionSchema)),
})

const StudyChoiceSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string(),
})

const CourseSchema = z.object({
  code: z.string(),
  name: z.string(),
  credit: z.string().nullable(),
  studyChoice: StudyChoiceSchema,
})

const CourseGroupSchema = z.object({
  code: z.string(),
  name: z.string(),
  courses: z.array(CourseSchema),
})

const StudyDirectionSchema = z.object({
  code: z.string().nullable(),
  name: z.string().nullable(),
  courseGroups: z.array(CourseGroupSchema).nullable(),
  studyWaypoints: z.array(StudyWaypointSchema),
})

type StudyDirection = z.infer<typeof StudyDirectionSchema>

const StudyPeriodSchema = z.object({
  periodNumber: z.string(),
  direction: StudyDirectionSchema,
})

const StudyplanSchema = z.object({
  code: z.string(),
  name: z.string(),
  year: z.number(),
  studyPeriods: z.array(StudyPeriodSchema),
})

const StudyplanEndpointSchema = z.object({
  studyplan: StudyplanSchema,
})

type Studyplan = z.infer<typeof StudyplanSchema>

export type StudyplanCourse = {
  code: string
  name: string
  year: number
  direction: { code: string; name: string } | null
  credit: string | null
  planCode: string
}

const STATIC_FALLBACK_DATA: Record<string, Studyplan> = {
  BIT: (await import("./static-fallback-data/BIT.json", { with: { type: "json" } })) as Studyplan,
  MSIT: (await import("./static-fallback-data/MSIT.json", { with: { type: "json" } })) as Studyplan,
}

/**
 * This repository gathers information about what courses are in, and what year they are in to be used to estimate a student's class grade
 * This is not a documented API, so it might not be reliable. In case it fails we have a fallback to static data for relevant study programmes
 */
export interface NTNUStudyPlanRepository {
  getStudyPlan(code: string, year: number): Promise<Studyplan>
  getStudyPlanCourses(code: string, year: number): Promise<StudyplanCourse[]>
}

export function getNTNUStudyplanRepository(): NTNUStudyPlanRepository {
  const endpoint = "https://www.ntnu.no/web/studier/studieplan"
  const logger = getLogger("ntnu-studyplan-repository")
  return {
    async getStudyPlan(code, year) {
      // magic
      const params = new URLSearchParams({
        p_p_id: "studyprogrammeplannerportlet_WAR_studyprogrammeplannerportlet_INSTANCE_qtfMiH5FDLzu",
        p_p_lifecycle: "2",
        p_p_resource_id: "studyplan",

        year: year.toString(),
        code,
      })

      let response: Response
      try {
        response = await fetch(`${endpoint}?${params.toString()}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch studyplan for ${code} ${year}: ${await response.text()}`)
        }
      } catch (error) {
        logger.error("Failed to fetch studyplan:", error)
        if (code in STATIC_FALLBACK_DATA) {
          logger.error("Using static data fallback because NTNU API failed")
          return STATIC_FALLBACK_DATA[code]
        }
        throw error
      }
      const data = await response.json()
      return StudyplanEndpointSchema.parse(data).studyplan
    },
    async getStudyPlanCourses(code, year) {
      const studyplan = await this.getStudyPlan(code, year)
      return studyplan.studyPeriods.flatMap((period) => getStudyDirectionCourses(period.direction, period.periodNumber))
    },
  }
}

function getStudyDirectionCourses(direction: StudyDirection, periodNumber: string) {
  const courses: StudyplanCourse[] = []

  // periodNumber is semester, so we calculate year from it
  // 1st and 2nd semester is year 1, 3rd and 4th semester is year 2, etc.
  const year = Math.floor((Number.parseInt(periodNumber) + 1) / 2)

  for (const courseGroup of direction.courseGroups ?? []) {
    const directionInfo = direction.code && direction.name ? { code: direction.code, name: direction.name } : null

    for (const course of courseGroup.courses) {
      courses.push({
        code: course.code,
        name: course.name,
        year,
        direction: directionInfo,
        planCode: course.studyChoice.code,
        credit: course.credit ?? null,
      })
    }
  }

  for (const waypoint of direction.studyWaypoints) {
    for (const direction of waypoint.studyDirections) {
      courses.push(...getStudyDirectionCourses(direction, periodNumber))
    }
  }

  return courses
}
