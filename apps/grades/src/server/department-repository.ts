import { z } from "zod"
import { type Database } from "@/server/kysely"

export type Department = z.infer<typeof Department>
export const Department = z.object({
  id: z.string().uuid(),
  refId: z.string(),
  facultyId: z.string().uuid(),
  name: z.string(),
})

export interface DepartmentRepository {
  getDepartmentById(id: string): Promise<Department | null>
}

export class DepartmentRepositoryImpl implements DepartmentRepository {
  constructor(private readonly db: Database) {}

  async getDepartmentById(id: string): Promise<Department | null> {
    const department = await this.db.selectFrom("department").selectAll().where("id", "=", id).executeTakeFirst()
    return department ? Department.parse(department) : null
  }
}
