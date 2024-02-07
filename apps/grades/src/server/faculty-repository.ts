import { z } from "zod"
import { type Insertable } from "kysely"
import { type NtnuFaculty } from "@/db.generated"
import { type Database } from "@/server/kysely"

export type Faculty = z.infer<typeof Faculty>
export const Faculty = z.object({
  id: z.string().uuid(),
  refId: z.string(),
  name: z.string(),
})

export interface FacultyRepository {
  createFaculty(input: Insertable<NtnuFaculty>): Promise<Faculty>
  getFacultyByReferenceId(refId: string): Promise<Faculty | null>
  getFacultyById(id: string): Promise<Faculty | null>
}

export class FacultyRepositoryImpl implements FacultyRepository {
  constructor(private readonly db: Database) {}

  async createFaculty(input: Insertable<NtnuFaculty>): Promise<Faculty> {
    const faculty = await this.db.insertInto("ntnuFaculty").values(input).returningAll().executeTakeFirstOrThrow()
    return Faculty.parse(faculty)
  }

  async getFacultyByReferenceId(refId: string): Promise<Faculty | null> {
    const faculty = await this.db.selectFrom("ntnuFaculty").selectAll().where("refId", "=", refId).executeTakeFirst()
    return faculty ? Faculty.parse(faculty) : null
  }

  async getFacultyById(id: string): Promise<Faculty | null> {
    const faculty = await this.db.selectFrom("ntnuFaculty").selectAll().where("id", "=", id).executeTakeFirst()
    return faculty ? Faculty.parse(faculty) : null
  }
}
