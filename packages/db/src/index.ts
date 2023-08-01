import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely"

import { Database } from "./types"
import pg from "pg"

export * from "./types"
export { CockroachDialect } from "./cockroach"

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var kysely: Kysely<Database> | undefined
}

export const kysely =
  global.kysely ||
  new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({
        connectionString: process.env.DATABASE_URL as string,
      }),
    }),
    plugins: [new CamelCasePlugin()],
  })

if (process.env.NODE_ENV !== "production") {
  global.kysely = kysely
}
