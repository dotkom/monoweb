import { AnySelectQueryBuilder } from "kysely"
import { z } from "zod"

export const CursorSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
})

export const PaginateInputSchema = z
  .object({
    take: z.number().positive(),
    cursor: CursorSchema.optional(),
  })
  .optional()
  .default({
    take: 20,
    cursor: undefined,
  })

export type Cursor = z.infer<typeof CursorSchema>

export const paginateQuery = (qb: AnySelectQueryBuilder, cursor: Cursor) => {
  return qb
    .where((qb) => qb.where("createdAt", "=", cursor.createdAt).where("id", "<", cursor.id))
    .orWhere("createdAt", "<", cursor.createdAt)
    .orderBy("createdAt", "desc")
    .orderBy("id", "desc")
}
