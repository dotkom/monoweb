import { SchemaModule, sql } from "kysely"

type DefaultOptions = {
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
    table = table.addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
  }
  if (options.createdAt) {
    table = table.addColumn("created_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
  }
  if (options.updatedAt) {
    table = table.addColumn("updated_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
  }
  return table
}
