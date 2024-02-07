import { z } from "zod"
import { type Insertable } from "kysely"
import { type NtnuFacultyDepartment } from "@/db.generated"
import { type Database } from "@/server/kysely"

export type Department = z.infer<typeof Department>
export const Department = z.object({
  id: z.string().uuid(),
  refId: z.string(),
  facultyId: z.string().uuid(),
  name: z.string(),
})

export interface DepartmentRepository {
  createDepartment(input: Insertable<NtnuFacultyDepartment>): Promise<Department>
  getDepartmentByReferenceId(refId: string): Promise<Department | null>
  getDepartmentById(id: string): Promise<Department | null>
}

export class DepartmentRepositoryImpl implements DepartmentRepository {
  constructor(private readonly db: Database) {}

  async createDepartment(input: Insertable<NtnuFacultyDepartment>): Promise<Department> {
    const department = await this.db
      .insertInto("ntnuFacultyDepartment")
      .values(input)
      .returningAll()
      .executeTakeFirstOrThrow()
    return Department.parse(department)
  }

  async getDepartmentByReferenceId(refId: string): Promise<Department | null> {
    const department = await this.db
      .selectFrom("ntnuFacultyDepartment")
      .selectAll()
      .where("refId", "=", refId)
      .executeTakeFirst()
    return department ? Department.parse(department) : null
  }

  async getDepartmentById(id: string): Promise<Department | null> {
    const department = await this.db
      .selectFrom("ntnuFacultyDepartment")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst()
    return department ? Department.parse(department) : null
  }
}
