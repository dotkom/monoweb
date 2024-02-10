import process from "node:process"
import pg from "pg"
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely"
import { type DB } from "@/db.generated"

export type Database = Awaited<ReturnType<typeof createKysely>>

export const createKysely = () => {
  const conn = new pg.Pool({
    connectionString: process.env.DATABASE_URL ?? "__MISSING_DATABASE_URL__",
  })
  return new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: conn,
    }),
    plugins: [new CamelCasePlugin()],
  })
}
