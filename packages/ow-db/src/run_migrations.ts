import { promises as fs } from "fs"
import { url } from "inspector"
import { CamelCasePlugin, FileMigrationProvider, Kysely, MigrationResultSet, Migrator, PostgresDialect } from "kysely"
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

export const migrator = new Migrator({
  db: db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: new URL("../migrations", import.meta.url).pathname,
  }),
})
