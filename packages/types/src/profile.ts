import { z } from "zod"

export const ProfileSchema = z.object({
  userId: z.string(),
  updatedAt: z.date(),
  showName: z.boolean(),
  visibleForOtherUsers: z.boolean(),
  showEmail: z.boolean(),
  showAdress: z.boolean(),
  visibleInEvents: z.boolean(),
  allowPictures: z.boolean(),
})
export const ProfileWriteSchema = ProfileSchema.partial({
  updatedAt: true,
})

export type Profile = z.infer<typeof ProfileSchema>
export type ProfileWrite = z.infer<typeof ProfileWriteSchema>
