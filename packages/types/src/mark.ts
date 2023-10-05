import { z } from "zod";

export const MarkSchema = z.object({
    id: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
    title: z.string(),
    category: z.string(),
    details: z.string(),
    duration: z.number(),
});

export type Mark = z.infer<typeof MarkSchema>;

export const MarkWriteSchema = MarkSchema.partial({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export type MarkWrite = z.infer<typeof MarkWriteSchema>;
