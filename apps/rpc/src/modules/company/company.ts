import { z } from "zod"

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string(),
  location: z.string().nullable(),
  imageUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

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

export const COMPANY_IMAGE_MAX_SIZE_KIB = 5 * 1024
