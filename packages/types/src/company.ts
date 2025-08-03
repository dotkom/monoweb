import { schemas } from "@dotkomonline/db/schemas"
import type { z } from "zod"

export const CompanySchema = schemas.CompanySchema.extend({})

export type CompanyId = Company["id"]
export type CompanySlug = Company["slug"]
export type Company = z.infer<typeof CompanySchema>

export const CompanyWriteSchema = CompanySchema.pick({
  name: true,
  slug: true,
  description: true,
  phone: true,
  email: true,
  website: true,
  location: true,
  imageUrl: true,
})

export type CompanyWrite = z.infer<typeof CompanyWriteSchema>
