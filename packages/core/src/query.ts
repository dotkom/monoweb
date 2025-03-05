import { z } from "zod"

export const PaginateInputSchema = z
  .object({
    take: z.number(),
    cursor: z.string().uuid().optional(),
  })
  .optional()
  .default({ take: 20, cursor: undefined })

export function pageQuery(page: Pageable): { orderBy: { id: "desc" }; cursor?: { id: string }; skip?: number } {
  if (!page || !page.cursor) return { orderBy: { id: "desc" as const } }

  return {
    cursor: { id: page.cursor },
    orderBy: { id: "desc" as const },
    skip: page.cursor ? 1 : 0,
  }
}

export type Pageable = z.infer<typeof PaginateInputSchema>
export type Cursor = Pageable["cursor"]
