import { z } from "zod";

export const CompanySchema = z.object({
  createdAt: z.date(),
  description: z.string(),
  email: z.string(),
  id: z.string().uuid(),
  image: z.string().nullable(),
  location: z.string().optional(),
  name: z.string().max(50),
  phone: z.string().optional(),
  type: z.enum(["Consulting", "Research", "Development", "Other"]).optional(),
  website: z.string(),
});

export type Company = z.infer<typeof CompanySchema>;

export const CompanyWriteSchema = CompanySchema.partial({
  createdAt: true,
  id: true,
});

export type CompanyWrite = z.infer<typeof CompanyWriteSchema>;
