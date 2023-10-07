import { z } from "zod";

export const CommitteeSchema = z.object({
  createdAt: z.date(),
  description: z.string(),
  email: z.string(),
  id: z.string().uuid(),
  image: z.string().nullable(),
  name: z.string(),
});

export type Committee = z.infer<typeof CommitteeSchema>;

export const CommitteeWriteSchema = CommitteeSchema.partial({
  createdAt: true,
  id: true,
});

export type CommitteeWrite = z.infer<typeof CommitteeWriteSchema>;
