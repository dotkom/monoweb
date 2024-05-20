import { z } from "zod"

export interface Collection<T> {
  data: T[]
  next: Cursor | null
}

// Cursors should be opaque!
export const CursorSchema = z.string()

export const PaginateInputSchema = z
  .object({
    take: z.number(),
    cursor: CursorSchema.optional(),
  })
  .optional()
  .default({ take: 20, cursor: undefined })

export type Pageable = z.infer<typeof PaginateInputSchema>
export type Cursor = z.infer<typeof CursorSchema>
