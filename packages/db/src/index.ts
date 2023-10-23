import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely"
import { env, Environment } from "@dotkomonline/env"
import pg from "pg"
import { type DB } from "./db.generated"

export { createMigrator } from './migrator'

export type Database = DB

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var kysely: Kysely<Database> | undefined
}

export const createKysely = (env: Environment) => new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      connectionString: env.DATABASE_URL,
    }),
  }),
  plugins: [new CamelCasePlugin()],
})

export const kysely =
  global.kysely ||　createKysely(env)

if (env.NODE_ENV !== "production") {
  global.kysely = kysely
}
