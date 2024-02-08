import { z } from "zod"
import { type Insertable, sql } from "kysely"
import { type Subject as DatabaseSubject } from "@/db.generated"
import { type Database } from "@/server/kysely"

export type Subject = z.infer<typeof Subject>
export const Subject = z.object({
  id: z.string().uuid(),
  refId: z.string(),
  departmentId: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  instructionLanguage: z.string(),
  educationalLevel: z.string(),
  credits: z.number(),
})

export interface SubjectRepository {
  createSubject(input: Insertable<DatabaseSubject>): Promise<Subject>
  getSubjectByReferenceId(refId: string): Promise<Subject | null>
  getSubjectById(id: string): Promise<Subject | null>
  getSubjectsBySearchExpression(expression: string, take: number, skip: number): Promise<Subject[]>
  getSubjectsByPopularity(take: number, skip: number): Promise<Subject[]>
}

export class SubjectRepositoryImpl implements SubjectRepository {
  constructor(private readonly db: Database) {}

  async createSubject(input: Insertable<DatabaseSubject>): Promise<Subject> {
    const subject = await this.db
      .insertInto("subject")
      .values(input)
      .onConflict((eb) => eb.columns(["refId"]).doUpdateSet({ ...input }))
      .returningAll()
      .executeTakeFirstOrThrow()
    return Subject.parse(subject)
  }

  async getSubjectByReferenceId(refId: string): Promise<Subject | null> {
    const subject = await this.db.selectFrom("subject").selectAll().where("refId", "=", refId).executeTakeFirst()
    return subject ? Subject.parse(subject) : null
  }

  async getSubjectById(id: string): Promise<Subject | null> {
    const subject = await this.db.selectFrom("subject").selectAll().where("id", "=", id).executeTakeFirst()
    return subject ? Subject.parse(subject) : null
  }

  async getSubjectsBySearchExpression(expression: string, take: number, skip: number): Promise<Subject[]> {
    // We want to match the expression case-insensitively, and we will also attempt to match the slug for the subject.
    // We should also find close matches using levenstein distance
    const subjects = await this.db
      .selectFrom("subject")
      .selectAll()
      .where((eb) =>
        eb.or([
          eb("name", "ilike", `%${expression}%`),
          eb("slug", "ilike", `%${expression}%`),
          eb(sql`levenshtein(subject.name, ${expression}::text)`, "<=", 1),
          eb(sql`levenshtein(subject.slug, ${expression}::text)`, "<=", 1),
        ])
      )
      .limit(take)
      .offset(skip)
      .execute()
    return subjects.map((x) => Subject.parse(x))
  }

  async getSubjectsByPopularity(take: number, skip: number): Promise<Subject[]> {
    // We determine popularity by the number of grades given to the subject
    const subjects = await this.db
      .selectFrom("subject")
      .leftJoin("subjectSeasonGrade", "subjectSeasonGrade.subjectId", "subject.id")
      .selectAll("subject")
      .select(({ eb }) => [
        eb
          .parens(
            sql`
          ${eb.fn.sum(eb.fn.coalesce("subjectSeasonGrade.gradedA", sql.lit(0)))} +
          ${eb.fn.sum(eb.fn.coalesce("subjectSeasonGrade.gradedB", sql.lit(0)))} + 
          ${eb.fn.sum(eb.fn.coalesce("subjectSeasonGrade.gradedC", sql.lit(0)))} +
          ${eb.fn.sum(eb.fn.coalesce("subjectSeasonGrade.gradedD", sql.lit(0)))} +
          ${eb.fn.sum(eb.fn.coalesce("subjectSeasonGrade.gradedE", sql.lit(0)))} +
          ${eb.fn.sum(eb.fn.coalesce("subjectSeasonGrade.gradedF", sql.lit(0)))} +
          ${eb.fn.sum(eb.fn.coalesce("subjectSeasonGrade.gradedPass", sql.lit(0)))} +
          ${eb.fn.sum(eb.fn.coalesce("subjectSeasonGrade.gradedFail", sql.lit(0)))}
          `
          )
          .as("students"),
      ])
      .groupBy("subject.id")
      .orderBy("students", "desc")
      .limit(take)
      .offset(skip)
      .execute()
    return subjects.map((x) => Subject.parse(x))
  }
}
