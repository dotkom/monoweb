import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely"
import pg, { type PoolConfig } from "pg"
import type { DB } from "./db.generated"
export type { DB as Database } from "./db.generated"

export { createMigrator } from "./migrator"

export const createKysely = (url: string, certificateAuthority?: string) => {
  // If the caller has provided a certificate authority, we pass it down to
  // node-postgres. This is required in production, but not for a local postgres
  // database from the docker compose configuration.
  let sslOptions: PoolConfig["ssl"] | undefined = undefined
  if (certificateAuthority !== undefined) {
    sslOptions = {
      rejectUnauthorized: true,
      ca: certificateAuthority,
    }
  }

  return new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({
        connectionString: url,
        ssl: sslOptions,
      }),
    }),
    plugins: [new CamelCasePlugin()],
  })
}

export type KyselyDatabase = Kysely<DB>
