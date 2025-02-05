import { z } from "zod"
import fs from "fs"

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
  credit: z.string(),
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
  planCode: string
}

const STATIC_FALLBACK_DATA: Record<string, Studyplan> = {
  BIT: (await import("./static-fallback-data/BIT.json")) as Studyplan,
  MSIT: (await import("./static-fallback-data/MSIT.json")) as Studyplan,
}

export interface NTNUStudyplanRepository {
  getStudyCourses(code: string, year: number): Promise<StudyplanCourse[]>
}

export class NTNUStudyplanRepositoryImpl implements NTNUStudyplanRepository {
  // This is not a documented API, so it might not be reliable
  private readonly endpoint = "https://www.ntnu.no/web/studier/studieplan"

  async getStudyplan(code: string, year: number): Promise<z.infer<typeof StudyplanSchema>> {
    const params = new URLSearchParams({
      p_p_id: "studyprogrammeplannerportlet_WAR_studyprogrammeplannerportlet_INSTANCE_qtfMiH5FDLzu",
      p_p_lifecycle: "2",
      p_p_resource_id: "studyplan",

      year: year.toString(),
      code,
    })

    let response;
    try {
      response = await fetch(`${this.endpoint}?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch studyplan for ${code} ${year}: ${await response.text()}`)
      }
    } catch (error) {
      console.error("Failed to fetch studyplan:", error)

      if (code in STATIC_FALLBACK_DATA) {
        console.error("Using static data fallback because NTNU API failed")

        return STATIC_FALLBACK_DATA[code]
      }

      throw error
    }

    const data = await response.json()

    return StudyplanEndpointSchema.parse(data).studyplan
  }

  private getStudyDirectionCourses(direction: z.infer<typeof StudyDirectionSchema>, periodNumber: string): StudyplanCourse[] {
    const courses = []

    for (const courseGroup of direction.courseGroups ?? []) {
      for (const course of courseGroup.courses) {
        courses.push({
          code: course.code,
          name: course.name,
          year: Math.floor((Number.parseInt(periodNumber) + 1) / 2),
          direction: direction.code && direction.name ? { code: direction.code, name: direction.name } : null,
          planCode: course.studyChoice.code,
        })
      }
    }

    for (const waypoint of direction.studyWaypoints) {
      for (const direction of waypoint.studyDirections) {
        courses.push(...this.getStudyDirectionCourses(direction, periodNumber))
      }
    }

    return courses
  }

  async getStudyCourses(code: string, year: number): Promise<StudyplanCourse[]> {
    const studyplan = await this.getStudyplan(code, year)

    return studyplan.studyPeriods.flatMap((period) => this.getStudyDirectionCourses(period.direction, period.periodNumber))
  }
}

