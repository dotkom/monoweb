import {
  type AnyColumn,
  type AnyColumnWithTable,
  type OperandValueExpression,
  type SelectQueryBuilder,
  sql,
} from "kysely"
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
  buildCursor: (values: unknown[]) => Cursor
}

type PaginatedQueryOptions<DB, TB extends keyof DB, C extends AnyColumn<DB, TB> | AnyColumnWithTable<DB, TB>, O> = {
  pageable: Pageable
  order: "asc" | "desc"
  decodeCursorOverride?: (cursor: Cursor) => OperandValueExpression<DB, TB, C>[]
  buildCursorOverride?: (record: O) => Cursor
  columns: C[]
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
  // Validate args
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

  const decodeCursor = options.decodeCursorOverride ?? defaultDecodeCursor
  // Take N+1 to determine if there is a record behind `take`.
  let pagedQuery = query.limit(take + 1)

  const columnSql = sql`(${sql.raw(options.columns.map((col) => `"${col}"`).join(","))})`
  pagedQuery = pagedQuery.orderBy(columnSql, order)

  if (cursor !== undefined) {
    // biome-ignore lint/style/noNonNullAssertion: see id default vals logic above
    const decodedCursor = decodeCursor!(cursor)
    // pagedQuery = pagedQuery.where(options.column[0], order === "asc" ? ">=" : "<=", decodedCursor[0])
    const _columns = sql`(${sql.raw(options.columns.map((col) => `"${col}"`).join(","))})`
    const _values = sql`(${sql.join(decodedCursor)})`

    pagedQuery = pagedQuery.where(_columns, order === "asc" ? ">=" : "<=", _values)
  }

  // Perform the query and build the output
  const records = await pagedQuery.execute()

  let nextCursor: Cursor | null
  const nextPageRecord = records.at(options.pageable.take) as O | undefined
  if (!nextPageRecord) {
    nextCursor = null
  } else {
    if (options.buildCursorOverride) {
      nextCursor = options.buildCursorOverride(nextPageRecord)
    } else {
      const values = options.columns.map((col) => nextPageRecord[col as keyof O])
      nextCursor = defaultEncodeCursor(values)
    }
  }

  return {
    next: nextCursor,
    data: records.slice(0, take), // Slice away the extra record if it exists
  }
}

export const base64Encode = (value: string) => Buffer.from(value).toString("base64")
export const base64Decode = (value: string) => Buffer.from(value, "base64").toString("ascii")

// Inspiration: https://github.com/charlie-hadden/kysely-paginate/blob/main/src/cursor.ts
export function defaultEncodeCursor(values: unknown[]): Cursor {
  const result: string[] = []

  for (const value of values) {
    switch (typeof value) {
      case "string":
        result.push(value)
        break

      case "number":
        result.push(value.toString(10))
        break

      // biome-ignore lint/suspicious/noFallthroughSwitchClause: <explanation>
      case "object": {
        if (value instanceof Date) {
          result.push(value.toISOString())
          break
        }
      }

      default:
        throw new Error(`Unable to encode '${value}'`)
    }
  }

  return Buffer.from(JSON.stringify(values)).toString("base64url")
}

export function defaultDecodeCursor(cursor: string) {
  try {
    return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"))
  } catch (error) {
    throw new Error("Unparsable cursor")
  }
}
