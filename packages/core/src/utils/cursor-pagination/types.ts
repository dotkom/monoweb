import { z } from "zod"

export interface Collection<T> {
  data: T[]
  next: Cursor | null
}

// Cursors are opaque strings that are parsed in the individual repositories
export const CursorSchema = z.string()

export const PaginateInputSchema = z
  .object({
    take: z.number(),
    cursor: CursorSchema.optional().nullable(),
  })
  .optional()
  .default({ take: 20, cursor: undefined })

export type Pageable = z.infer<typeof PaginateInputSchema>
export type Cursor = z.infer<typeof CursorSchema>
