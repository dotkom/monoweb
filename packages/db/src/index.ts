import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely"
import pg from "pg"
import type { DB } from "./db.generated"
export type { DB as Database } from "./db.generated"

export { createMigrator } from "./migrator"

export const createKysely = (url: string) => {
  return new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({
        connectionString: url,
      }),
    }),
    plugins: [new CamelCasePlugin()],
  })
}

export type KyselyDatabase = Kysely<DB>
