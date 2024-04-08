import { type Environment, env } from "@dotkomonline/env"
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely"
import pg from "pg"
import type { DB } from "./db.generated"

export { createMigrator } from "./migrator"

export type Database = DB

declare global {
  let kysely: Kysely<Database> | undefined
}

export const createKysely = (env: Environment) =>
  new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({
        connectionString: env.DATABASE_URL,
      }),
    }),
    plugins: [new CamelCasePlugin()],
  })

// @ts-expect-error: does not like re-declaring global
// biome-ignore lint/suspicious/noRedeclare: error
export const kysely = global.kysely || createKysely(env)

if (env.NODE_ENV !== "production") {
  // @ts-expect-error: does not like re-declaring global
  global.kysely = kysely
}
