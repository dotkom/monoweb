import { z } from "zod"

export const OfflineSchema = z.object({
  id: z.string().ulid(),
  title: z.string().max(1000).min(1),
  published: z.date(),
  file: z.string(), // s3 link
  image: z.string(), // s3 link
})

export const OfflineWriteSchema = OfflineSchema.partial({
  id: true,
  createdAt: true,
})

export type Offline = z.infer<typeof OfflineSchema>
export type OfflineId = Offline["id"]
export type OfflineWrite = z.infer<typeof OfflineWriteSchema>
