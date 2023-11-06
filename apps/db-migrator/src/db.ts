import { type Database } from "@dotkomonline/db"
import { Kysely, CamelCasePlugin, PostgresDialect } from "kysely"
import pg from "pg"
import { env } from "@dotkomonline/env"

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      connectionString: env.DATABASE_URL,
    }),
  }),
  plugins: [new CamelCasePlugin()],
})
