import { schemas } from "@dotkomonline/db/schemas"
import type { z } from "zod"

export const CompanySchema = schemas.CompanySchema.extend({})

export type CompanyId = Company["id"]
export type Company = z.infer<typeof CompanySchema>

export const CompanyWriteSchema = CompanySchema.partial({
  id: true,
  createdAt: true,
})

export type CompanyWrite = z.infer<typeof CompanyWriteSchema>
