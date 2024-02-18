import { z } from "zod"
import { type Database } from "@/server/kysely"

export type Grade = z.infer<typeof Grade>
export type Season = Grade["season"]
export const Grade = z.object({
  id: z.string().uuid(),
  subjectId: z.string().uuid(),
  season: z.enum(["SPRING", "AUTUMN", "WINTER", "SUMMER"]),
  year: z.number(),

  gradedA: z.number().int().nullable().default(null),
  gradedB: z.number().int().nullable().default(null),
  gradedC: z.number().int().nullable().default(null),
  gradedD: z.number().int().nullable().default(null),
  gradedE: z.number().int().nullable().default(null),
  gradedF: z.number().int().nullable().default(null),

  gradedFail: z.number().int().nullable().default(null),
  gradedPass: z.number().int().nullable().default(null),
})

export interface GradeRepository {
  getGradeBySemester(subjectId: string, season: Season, year: number): Promise<Grade | null>
}

export class GradeRepositoryImpl implements GradeRepository {
  constructor(private readonly db: Database) {}

  async getGradeBySemester(subjectId: string, season: Season, year: number): Promise<Grade | null> {
    const grade = await this.db
      .selectFrom("subjectSeasonGrade")
      .selectAll()
      .where("subjectId", "=", subjectId)
      .where("season", "=", season)
      .where("year", "=", year)
      .executeTakeFirst()
    return grade ? Grade.parse(grade) : null
  }
}
