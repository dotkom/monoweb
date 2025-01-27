import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely"
import pg, { type PoolConfig } from "pg"
import type { DB } from "./db.generated"
export type { DB as Database } from "./db.generated"
import { getLogger } from "@dotkomonline/logger"

export { createMigrator } from "./migrator"
const logger = getLogger("@dotkomonline/db")

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

  // If there are no certificates attached, we issue a warning so that it's easy
  // to catch misconfigurations in non-local environments.
  if (sslOptions === undefined) {
    logger.warn(
      "No certificate authority provided. This is required if you are connecting to staging/production databases."
    )
    logger.warn("- This configuration is only supported for local development.")
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
