import { z } from "zod"
import { type Insertable } from "kysely"
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
}

export class SubjectRepositoryImpl implements SubjectRepository {
  constructor(private readonly db: Database) {}

  async createSubject(input: Insertable<DatabaseSubject>): Promise<Subject> {
    const subject = await this.db.insertInto("subject").values(input).returningAll().executeTakeFirstOrThrow()
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
}
