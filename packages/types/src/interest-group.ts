import { z } from "zod";

export const InterestGroupSchema = z.object({
  id: z.string().ulid(),
  createdAt: z.date(),
  name: z.string(),
  description: z.string(),
  image: z.string().nullable(),
});

export type InterestGroup = z.infer<typeof InterestGroupSchema>;
export type InterestGroupId = InterestGroup["id"];

export const InterestGroupWriteSchema = InterestGroupSchema.partial({
  id: true,
  createdAt: true,
});

export type InterestGroupWrite = z.infer<typeof InterestGroupWriteSchema>;
