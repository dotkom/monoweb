import { Company as PrismaCompany } from "@dotkomonline/db"
import { z } from "zod"

const companySchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(50),
  description: z.string(),
  phone: z.string().optional(),
  email: z.string(),
  website: z.string(),
  location: z.string().optional(),
  type: z.enum(["Consulting", "Research", "Development", "Other"]).optional(),
})

export type Company = z.infer<typeof companySchema>
export type InsertCompany = Omit<Company, "id">

export const mapToCompany = (payload: PrismaCompany): Company => {
  return companySchema.parse(payload)
}
