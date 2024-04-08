import type { CreateTableBuilder, SchemaModule } from "kysely"

interface DefaultOptions {
  id?: boolean
  createdAt?: boolean
  updatedAt?: boolean
}

export const createTableWithDefaults: (
  tableName: string,
  options: DefaultOptions,
  schema: SchemaModule
) => CreateTableBuilder<string>
