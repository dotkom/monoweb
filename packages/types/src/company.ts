import { z } from "zod"

export const CompanySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  name: z.string().max(50).min(1),
  description: z.string().min(1),
  email: z.string().email().min(1),
  website: z.string().min(1),
  type: z.enum(["Consulting", "Research", "Development", "Other"]),

  location: z.string().nullable(),
  image: z.string().nullable(),
  phone: z.string().nullable(),
})

export type Company = z.infer<typeof CompanySchema>

export const CompanyWriteSchema = CompanySchema.partial({
  id: true,
  createdAt: true,
})

export type CompanyWrite = z.infer<typeof CompanyWriteSchema>
