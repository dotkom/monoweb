import fs from "node:fs/promises"
import path from "node:path"
import { FileMigrationProvider, type Kysely, Migrator } from "kysely"
import type { Database } from "./"

export const createMigrator = (db: Kysely<Database>, urlOverride?: URL) => {
  console.log("VALUE:");
  console.log((urlOverride ?? new URL("migrations", new URL(import.meta.url))).pathname)
  return new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: (urlOverride ?? new URL("migrations", new URL(import.meta.url))).pathname,
    }),
  })
}
