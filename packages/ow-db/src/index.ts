import { Kysely, PostgresDialect, CamelCasePlugin } from "kysely"
import { Pool } from "pg"
import { Database } from "./types"

export * from "./types"

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var kysely: Kysely<Database> | undefined
}

export const kysely =
  global.kysely ||
  new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: process.env.DATABASE_URL as string,
      }),
    }),
    plugins: [new CamelCasePlugin()],
  })

if (process.env.NODE_ENV !== "production") {
  global.kysely = kysely
}
