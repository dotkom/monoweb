import fs from "fs/promises"
import path from "path"
import { FileMigrationProvider, type Kysely, Migrator } from "kysely"
import { type Database } from "./"

export const createMigrator = (db: Kysely<Database>, urlOverride?: URL) =>
  new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: (urlOverride ?? new URL("migrations", new URL(import.meta.url))).pathname,
    }),
  })
