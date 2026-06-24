import { z } from "zod"

export const OfflineSchema = z.object({
  id: z.string(),
  title: z.string(),
  fileUrl: z.string().nullable(),
  imageUrl: z.string().nullable(),
  publishedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const OfflineWriteSchema = OfflineSchema.partial({
  id: true,
  updatedAt: true,
  createdAt: true,
})

export type Offline = z.infer<typeof OfflineSchema>
export type OfflineId = Offline["id"]
export type OfflineWrite = z.infer<typeof OfflineWriteSchema>

export const OFFLINE_FILE_MAX_SIZE_KIB = 50 * 1024
export const OFFLINE_IMAGE_MAX_SIZE_KIB = 5 * 1024
