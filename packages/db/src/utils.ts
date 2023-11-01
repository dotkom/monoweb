import { type SchemaModule, sql } from "kysely"

interface DefaultOptions {
  id?: boolean
  createdAt?: boolean
  updatedAt?: boolean
}

/**
 * Creates a table with default common fields.
 */
export const createTableWithDefaults = (tableName: string, options: DefaultOptions, schema: SchemaModule) => {
  let table = schema.createTable(tableName)
  if (options.id) {
    table = table.addColumn("id", sql`ulid`, (col) => col.primaryKey().defaultTo(sql`gen_ulid()`))
  }
  if (options.createdAt) {
    table = table.addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
  }
  if (options.updatedAt) {
    table = table.addColumn("updated_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
  }
  return table
}
