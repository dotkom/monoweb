import { type SelectQueryBuilder, sql } from "kysely"
import type { Cursor, Pageable } from "./types"

type GetNextCursorOptions<T> = {
  pageable: Pageable
  buildCursor: (record: T) => Cursor
}
export function getNextCursor<T>(records: T[], options: GetNextCursorOptions<T>): Cursor | null {
  // We fetched take+1 records to determine if there is a record behind `take`.
  // If we got exactly `take+1` records, there is a next page.
  const hasNextPage = records.length === options.pageable.take + 1
  if (!hasNextPage) {
    return null
  }

  return options.buildCursor(records[records.length - 1])
}

type PaginatedQueryOptions = {
  pageable: Pageable
  decodeCursor: (cursor: Cursor) => string
}
export function paginatedQuery<DB, TB extends keyof DB, T>(
  query: SelectQueryBuilder<DB, TB, T>,
  options: PaginatedQueryOptions
) {
  const { pageable, decodeCursor } = options
  // Take N+1 to determine if there is a record behind `take`.
  const pageWithNextLength = pageable.take + 1
  let pagedQuery = query

  pagedQuery = query.limit(pageWithNextLength)
  pagedQuery = pagedQuery.orderBy(sql`createdAt`, "desc")
  if (pageable.cursor !== undefined) {
    const cursor = decodeCursor(pageable.cursor)
    pagedQuery = pagedQuery.where(sql`createdAt`, "<", sql`${cursor}`)
  }

  // Perform the query and build the output
  return pagedQuery
}
