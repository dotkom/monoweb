import { z } from "zod"

export const CompanySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  name: z.string().max(50),
  description: z.string(),
  phone: z.string().optional(),
  email: z.string(),
  website: z.string(),
  location: z.string().optional(),
  type: z.enum(["Consulting", "Research", "Development", "Other"]).optional(),
})

export type Company = z.infer<typeof CompanySchema>

export const InsertCompanySchema = CompanySchema.omit({
  id: true,
  createdAt: true,
})

export type InsertCompany = z.infer<typeof InsertCompanySchema>
