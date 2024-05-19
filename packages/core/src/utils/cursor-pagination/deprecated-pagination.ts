import { type SelectQueryBuilder, sql } from "kysely"
import { z } from "zod"

/**
 * @deprecated Use singleColPaginatedQuery instead.
 */
export function orderedQuery<DB, TB extends keyof DB, O>(qb: SelectQueryBuilder<DB, TB, O>, cursor?: Cursor) {
  let queryBuilder = qb

  if (cursor) {
    queryBuilder = qb.where(sql`id`, "<", sql`${cursor.id}`)
  }

  return queryBuilder.orderBy(sql`id`, "desc")
}

/**
 * @deprecated
 */
export const CursorSchema = z.object({
  id: z.string().ulid(),
})

/**
 * @deprecated
 */
export const PaginateInputSchema = z
  .object({
    take: z.number(),
    cursor: CursorSchema.optional(),
  })
  .optional()
  .default({ take: 20, cursor: undefined })

/**
 * @deprecated
 */
export type Cursor = z.infer<typeof CursorSchema>
