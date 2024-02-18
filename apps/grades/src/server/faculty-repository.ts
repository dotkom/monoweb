import { z } from "zod"
import { type Database } from "@/server/kysely"

export type Faculty = z.infer<typeof Faculty>
export const Faculty = z.object({
  id: z.string().uuid(),
  refId: z.string(),
  name: z.string(),
})

export interface FacultyRepository {
  getFacultyById(id: string): Promise<Faculty | null>
}

export class FacultyRepositoryImpl implements FacultyRepository {
  constructor(private readonly db: Database) {}

  async getFacultyById(id: string): Promise<Faculty | null> {
    const faculty = await this.db.selectFrom("faculty").selectAll().where("id", "=", id).executeTakeFirst()
    return faculty ? Faculty.parse(faculty) : null
  }
}
