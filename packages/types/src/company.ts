import type { z } from "zod"
import { dbSchemas } from "@dotkomonline/db"

export const CompanySchema = dbSchemas.CompanySchema.extend({})

export type CompanyId = Company["id"]
export type Company = z.infer<typeof CompanySchema>

export const CompanyWriteSchema = CompanySchema.partial({
  id: true,
  createdAt: true,
})

export type CompanyWrite = z.infer<typeof CompanyWriteSchema>
