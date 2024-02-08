import process from "node:process"
import pg from "pg"
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely"
import { getLogger } from "@dotkomonline/logger"
import { type DB } from "@/db.generated"

export type Database = Awaited<ReturnType<typeof createKysely>>

const logger = getLogger("server/kysely")

export const createKysely = () => {
  const conn = new pg.Pool({
    connectionString: process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5433/postgres",
  })
  return new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: conn,
    }),
    plugins: [new CamelCasePlugin()],
    log: (evt) => {
      logger.info(evt.query.sql)
    },
  })
}
