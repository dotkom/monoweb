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

type StudyplanCourse = {
  code: string
  name: string
  year: number
  direction: { code: string; name: string } | null
  planCode: string
}

export interface NTNUStudyplanRepository {
  getStudyplan(code: string, year: number): Promise<z.infer<typeof StudyplanSchema>>
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
    const response = await fetch(`${this.endpoint}?${params.toString()}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch studyplan: ${await response.text()}`)
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
