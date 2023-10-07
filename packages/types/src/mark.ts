import { z } from "zod";

export const MarkSchema = z.object({
  category: z.string(),
  createdAt: z.date(),
  details: z.string(),
  duration: z.number(),
  id: z.string().uuid(),
  title: z.string(),
  updatedAt: z.date(),
});

export type Mark = z.infer<typeof MarkSchema>;

export const MarkWriteSchema = MarkSchema.partial({
  createdAt: true,
  id: true,
  updatedAt: true,
});

export type MarkWrite = z.infer<typeof MarkWriteSchema>;
