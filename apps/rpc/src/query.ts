import { z } from "zod"

export const PaginateInputSchema = z
  .object({
    take: z.number(),
    cursor: z.string().uuid().optional(),
  })
  .optional()
  .default({ take: 20, cursor: undefined })

export type Pageable = z.infer<typeof PaginateInputSchema>
export type Cursor = Pageable["cursor"]

interface PageQuery {
  orderBy: { id: "desc" }
  cursor?: { id: string }
  skip?: number
  take?: number
}

export function pageQuery(page: Pageable): PageQuery {
  return {
    orderBy: { id: "desc" as const },
    cursor: page.cursor ? { id: page.cursor } : undefined,
    skip: page.cursor ? 1 : 0,
    take: page.take,
  }
}
