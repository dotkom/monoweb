import type { AnyColumn, AnyColumnWithTable, OperandValueExpression, SelectQueryBuilder } from "kysely"
import { z } from "zod"

export interface PaginatedResult<T> {
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

type GetNextCursorOptions<T> = {
  pageable: Pageable
  buildCursor: (record: T) => Cursor
}

function getNextCursor<T>(records: T[], options: GetNextCursorOptions<T>): Cursor | null {
  // We fetched take+1 records to determine if there is a record behind `take`.
  // If we got exactly `take+1` records, there is a next page.
  const hasNextPage = records.length === options.pageable.take + 1
  if (!hasNextPage) {
    return null
  }

  // biome-ignore lint/style/noNonNullAssertion: We know there is a record at -1 from the check above.
  return options.buildCursor(records.at(-1)!)
}

type PaginatedQueryOptions<DB, TB extends keyof DB, C extends AnyColumn<DB, TB> | AnyColumnWithTable<DB, TB>, O> = {
  pageable: Pageable
  order: "asc" | "desc"
  decodeCursor?: (cursor: Cursor) => OperandValueExpression<DB, TB, C>
  buildCursor?: (record: O) => Cursor
  column: C
}

/**
 * Add cursor based pagination to a query based on ordering by a single column, e.g. created_at.
 *
 * Cursors are opaque strings that represent the next record that will be fetched in the ordered set of records based on the given column.
 * A cursor value of `null` will return no records, and is returned when there are no extra records to fetch.
 * A cursor value of `undefined` will return the first `take` records.
 *
 * For more complex queries that require ordering by multiple columns, manual implementation
 * is needed.
 */
export async function singleColPaginatedQuery<
  DB,
  TB extends keyof DB,
  O,
  C extends AnyColumn<DB, TB> | AnyColumnWithTable<DB, TB>,
>(query: SelectQueryBuilder<DB, TB, O>, options: PaginatedQueryOptions<DB, TB, C, O>) {
  const {
    pageable: { cursor, take },
    order,
  } = options

  if (cursor === null) {
    return {
      next: null,
      data: [],
    }
  }

  if (options.column === "id") {
    return singleColPaginatedQuery(query, {
      ...options,
      decodeCursor: decodeUlidIdCursor as (cursor: Cursor) => OperandValueExpression<DB, TB, C>,
      buildCursor: buildUlidIdCursor as (record: O) => Cursor,
    })
  }

  if (options.decodeCursor === undefined || options.buildCursor === undefined) {
    throw new Error("decodeCursor and buildCursor must be provided when column is not 'id'")
  }

  // Take N+1 to determine if there is a record behind `take`.
  const pageWithNextLength = take + 1
  let pagedQuery = query.limit(pageWithNextLength)
  pagedQuery = pagedQuery.orderBy(options.column, order)
  if (cursor !== undefined) {
    const decodedCursor = options.decodeCursor(cursor)
    pagedQuery = pagedQuery.where(options.column, order === "asc" ? ">=" : "<=", decodedCursor)
  }

  // Perform the query and build the output
  const records = await pagedQuery.execute()

  const nextCursor = getNextCursor(records, {
    pageable: {
      cursor,
      take,
    },
    buildCursor: options.buildCursor,
  })

  return {
    next: nextCursor,
    data: records.slice(0, take), // Don't include take+1 record used for determining next page
  }
}

export const base64Encode = (value: string) => Buffer.from(value).toString("base64")
export const base64Decode = (value: string) => Buffer.from(value, "base64").toString("ascii")

type RecordWithUlidId = { id: string }
export function buildUlidIdCursor<O extends RecordWithUlidId>(record: O): Cursor {
  return base64Encode(record.id)
}
export function decodeUlidIdCursor(cursor: Cursor): string {
  return base64Decode(cursor)
}

type RecordWithCreatedAt = { createdAt: string }
export function buildCreatedAtCursor<O extends RecordWithCreatedAt>(record: O): Cursor {
  return base64Encode(record.createdAt)
}
export function decodeCreatedAtCursor(cursor: Cursor): string {
  return base64Decode(cursor)
}
