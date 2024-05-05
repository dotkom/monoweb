import { type SelectQueryBuilder, sql } from "kysely"
import { z } from "zod"

export type Keys<T> = {
  [K in keyof T]: unknown
}

type ObjectWithKey<T> = T extends object ? T : never
type ObjectWithStringifiedProperty<T extends object, K extends keyof T> = T & { [Property in K]: string }

export function withInsertJsonValue<T extends object, K extends keyof T>(
  originalObject: ObjectWithKey<T>,
  propertyToConvert: K
): ObjectWithStringifiedProperty<T, K> {
  const stringifiedPropertyValue = JSON.stringify(originalObject[propertyToConvert])

  return {
    ...originalObject,
    [propertyToConvert]: stringifiedPropertyValue,
  }
}

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

export type Pageable = z.infer<typeof PaginateInputSchema>
export type Cursor = z.infer<typeof CursorSchema>

export function orderedQuery<DB, TB extends keyof DB, O>(qb: SelectQueryBuilder<DB, TB, O>, cursor?: Cursor) {
  let queryBuilder = qb

  if (cursor) {
    queryBuilder = qb.where(sql`id`, "<", sql`${cursor.id}`)
  }

  return queryBuilder.orderBy(sql`id`, "desc")
}
