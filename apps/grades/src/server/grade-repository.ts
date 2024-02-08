import { z } from "zod"
import { type Insertable, type Updateable } from "kysely"
import { type SubjectSeasonGrade } from "@/db.generated"
import { type Database } from "@/server/kysely"
import { HkdirGrade, type HkdirGradeKey } from "@/server/hkdir-service"
import { mapHkdirGradeToGradeFactor } from "@/server/hkdir-util"

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

export type GradeWriteLog = z.infer<typeof GradeWriteLog>
export const GradeWriteLog = z.object({
  id: z.string().uuid(),
  subjectId: z.string().uuid(),
  season: Grade.shape.season,
  year: z.number(),
  grade: HkdirGrade.shape.Karakter,
  createdAt: z.date().nullable(),
})

export interface GradeRepository {
  createGrade(input: Insertable<SubjectSeasonGrade>): Promise<Grade>
  updateGrade(id: string, input: Updateable<SubjectSeasonGrade>, hkdirKey: HkdirGradeKey, count: number): Promise<void>
  getGradeBySemester(subjectId: string, season: Season, year: number): Promise<Grade | null>
  getPreviousWriteLogEntry(
    subjectId: string,
    season: Season,
    year: number,
    grade: HkdirGradeKey
  ): Promise<GradeWriteLog | null>
}

export class GradeRepositoryImpl implements GradeRepository {
  constructor(private readonly db: Database) {}

  async createGrade(input: Insertable<SubjectSeasonGrade>): Promise<Grade> {
    const grade = await this.db
      .insertInto("subjectSeasonGrade")
      .values(input)
      .onConflict((eb) => eb.columns(["subjectId", "season", "year"]).doUpdateSet({ ...input }))
      .returningAll()
      .executeTakeFirstOrThrow()
    return Grade.parse(grade)
  }

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

  async updateGrade(
    id: string,
    input: Updateable<SubjectSeasonGrade>,
    hkdirKey: HkdirGradeKey,
    count: number
  ): Promise<void> {
    await this.db
      .transaction()
      .setIsolationLevel("read committed")
      .execute(async (tx) => {
        // If this throws, then it means we have a read inconsistency from the caller.
        const grade = await tx
          .selectFrom("subjectSeasonGrade")
          .select(["subjectId", "season", "year"])
          .where("id", "=", id)
          .forUpdate()
          .executeTakeFirstOrThrow()
        await tx
          .insertInto("subjectSeasonGradeWriteLog")
          .values({
            subjectId: grade.subjectId,
            season: grade.season,
            year: grade.year,
            grade: hkdirKey,
          })
          .execute()
        // We need to update the grade distribution for the current grade as well.
        if (count !== 0 && hkdirKey !== "H" && hkdirKey !== "G") {
          const { totalRegistered, averageGrade } = await tx
            .selectFrom("subject")
            .select(["totalRegistered", "averageGrade"])
            .where("id", "=", grade.subjectId)
            .executeTakeFirstOrThrow()
          const newTotalRegistered = totalRegistered + count
          const multiplicationFactor = mapHkdirGradeToGradeFactor(hkdirKey)
          const newAverageGrade = (averageGrade * totalRegistered + count * multiplicationFactor) / newTotalRegistered
          // Set the new average grade and total registered count
          await tx
            .updateTable("subject")
            .set({
              totalRegistered: newTotalRegistered,
              averageGrade: newAverageGrade,
            })
            .where("id", "=", grade.subjectId)
            .execute()
        }

        return await tx
          .updateTable("subjectSeasonGrade")
          .set(input)
          .where("id", "=", id)
          .returningAll()
          .executeTakeFirstOrThrow()
      })
  }

  async getPreviousWriteLogEntry(
    subjectId: string,
    season: Season,
    year: number,
    grade: HkdirGradeKey
  ): Promise<GradeWriteLog | null> {
    const writeLog = await this.db
      .selectFrom("subjectSeasonGradeWriteLog")
      .selectAll()
      .where("subjectId", "=", subjectId)
      .where("season", "=", season)
      .where("year", "=", year)
      .where("grade", "=", grade)
      .orderBy("createdAt", "desc")
      .limit(1)
      .executeTakeFirst()
    return writeLog ? GradeWriteLog.parse(writeLog) : null
  }
}
