import { type SelectQueryBuilder, sql } from "kysely"
import { z } from "zod"

// Helper function that provides typing to the `json_build_object` Postgres function.
export function jsonBuildObject<T extends object>(object: Record<keyof T, string>): string {
  const entries = Object.entries(object)
  const entriesString = entries.map(([key, value]) => `'${key}', ${value}`).join(", ")
  return `json_build_object(${entriesString})`
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

/**
 * Wrap a sub-query with the necessary pagination queries, and return the resulting collection.
 *
 * This takes a QueryBuilder created with `db.selectFrom(...)` and a cursor, and fetches the requested page from the
 * database. Then it maps each database record to a wanted output type.
 */
export const paginatedQuery = async <T extends OrderedIdentifier, DB, TB extends keyof DB, O extends OrderedIdentifier>(
  qb: SelectQueryBuilder<DB, TB, O>,
  pageable: Pageable,
  mapper: (payload: O) => T
): Promise<Collection<T>> => {
  // Take N+1 to determine if there is a record behind `take`.
  const pageWithNextLength = pageable.take + 1
  let builder = qb.limit(pageWithNextLength)
  // If a cursor was provided, skip forwards to the specified record
  if (pageable.cursor !== undefined) {
    builder = builder.where(sql`id`, "<", sql`${pageable.cursor.id}`)
  }
  // Always perform ordering on id.
  builder = builder.orderBy(sql`id`, "desc")

  // Perform the query and build the output
  const records = await builder.execute()
  const hasNextCursor = records.length !== 0 && records.length === pageWithNextLength
  const last = records.at(-1)

  let cursor: Cursor | null = null
  if (hasNextCursor && last !== undefined) {
    cursor = {
      id: last.id,
    }
  }

  const data = records.slice(0, pageable.take).map(mapper)
  return {
    next: cursor,
    data,
    count: Math.min(pageable.take, data.length),
  }
}

/**
 * Trait type for anything that has an id.
 *
 * Any type that should be pageable in the collections system must have an identifier that is monotonically ordered. In
 * our case, we have ULID identifiers on all resources.
 */
export interface OrderedIdentifier {
  id: string
}

export interface Collection<T extends OrderedIdentifier> {
  data: T[]
  count: number
  next: Cursor | null
}
