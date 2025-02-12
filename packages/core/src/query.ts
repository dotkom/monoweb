import { z } from "zod"

export const PaginateInputSchema = z
  .object({
    take: z.number(),
    cursor: z.string().uuid().optional()
  })
  .optional()
  .default({ take: 20, cursor: undefined })

export type Pageable = z.infer<typeof PaginateInputSchema>
export type Cursor = Pageable["cursor"]
