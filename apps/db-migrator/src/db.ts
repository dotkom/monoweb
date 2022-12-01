import { Database } from "@dotkomonline/db"
import { Kysely, PostgresDialect, CamelCasePlugin } from "kysely"
import pg from "pg"

import { env } from "./env"

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      connectionString: env.DATABASE_URL,
    }),
  }),
  plugins: [new CamelCasePlugin()],
})
