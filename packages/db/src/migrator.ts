import fs from "fs/promises"
import path from "path"
import { FileMigrationProvider, type Kysely, Migrator } from "kysely"
import { type Database } from "./"

export const createMigrator = (db: Kysely<Database>, url = new URL("migrations", import.meta.url)) =>
  new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: url.pathname,
    }),
  })
