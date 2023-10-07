import { z } from "zod";

export const UserSchema = z.object({
  cognitoSub: z.string().uuid(),
  createdAt: z.date(),
  id: z.string(),
});

export type User = z.infer<typeof UserSchema>;
export type UserId = User["id"];

export const UserWriteSchema = UserSchema.omit({
  createdAt: true,
  id: true,
});

export type UserWrite = z.infer<typeof UserWriteSchema>;
