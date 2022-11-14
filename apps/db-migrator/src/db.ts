import { Database } from "@dotkomonline/db"
import { Kysely, PostgresDialect, CamelCasePlugin } from "kysely"
import pg from "pg"

import { env } from "./env"

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      host: env.DB_HOST,
      port: env.DB_PORT,
    }),
  }),
  plugins: [new CamelCasePlugin()],
})
