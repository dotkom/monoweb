import { promises as fs } from "fs"
import { CamelCasePlugin, FileMigrationProvider, Kysely, Migrator, PostgresDialect } from "kysely"
import * as path from "path"
import pg from "pg"

import { Database } from "./types"

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      host: "localhost",
      port: 6543,
      user: "ow",
      database: "ow",
      password: "owpassword123",
    }),
  }),
  plugins: [new CamelCasePlugin()],
})

const migrator = new Migrator({
  db: db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: "/workspaces/monoweb/packages/ow-db/src/migrations",
  }),
})

const { error, results } = await migrator.migrateToLatest()
results?.forEach((it) => {
  if (it.status === "Success") {
    console.log(`migration "${it.migrationName}" was executed successfully`)
  } else if (it.status === "Error") {
    console.error(`failed to execute migration "${it.migrationName}"`)
  }
})

if (error) {
  console.error("failed to migrate")
  console.error(error)
  process.exit(1)
}

await db.destroy()
