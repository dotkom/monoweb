import { z } from "zod"

export const CompanySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  name: z.string().max(50),
  description: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string().nullable(),
  location: z.string().nullable(),
  type: z.enum(["Consulting", "Research", "Development", "Other"]).nullable(),
  image: z.string().nullable(),
})

export type Company = z.infer<typeof CompanySchema>

export const CompanyWriteSchema = CompanySchema.partial({
  id: true,
  createdAt: true,
})

export type CompanyWrite = z.infer<typeof CompanyWriteSchema>
