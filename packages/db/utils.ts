export interface DeleteResult {
  numDeletedRows: number
}

// https://github.com/kysely-org/kysely/issues/316
export interface InsertResult {
  insertId: number | undefined // InsertId may not be available when the table's primary key is not an auto increment column.
  numInsertedOrUpdatedRows: number | undefined
}

export interface UpdateResult {
  numUpdatedRows: number
  numChangedRows?: number
}
