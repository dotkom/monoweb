import { SelectQueryBuilder, sql } from "kysely"
import { z } from "zod"

export const CursorSchema = z.object({
  id: z.string().ulid(),
})

export const PaginateInputSchema = z
  .object({
    take: z.number(),
    cursor: CursorSchema.optional(),
  })
  .optional()
  .default({ take: 20, cursor: undefined })

export type Cursor = z.infer<typeof CursorSchema>

export function orderedQuery<DB, TB extends keyof DB, O>(qb: SelectQueryBuilder<DB, TB, O>, cursor?: Cursor) {
  if (cursor) {
    qb = qb.where(sql`id`, "<", sql`${cursor.id}`)
  }
  return qb.orderBy(sql`id`, "desc")
}
