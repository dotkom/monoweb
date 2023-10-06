import { z } from "zod";

export const PersonalMarkSchema = z.object({
  markId: z.string(),
  userId: z.string(),
});

export type PersonalMark = z.infer<typeof PersonalMarkSchema>;

export const PersonalMarkWriteSchema = PersonalMarkSchema;

export type PersonalMarkWrite = z.infer<typeof PersonalMarkWriteSchema>;
