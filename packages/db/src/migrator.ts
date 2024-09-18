import fs from "node:fs/promises"
import path from "node:path"
import os from "node:os"
import { FileMigrationProvider, type Kysely, Migrator } from "kysely"
import type { Database } from "./"

export const createMigrator = (db: Kysely<Database>, urlOverride?: URL) => {
  const migrationFolder = (urlOverride ?? new URL("migrations", new URL(import.meta.url))).pathname
  console.log(`migrationFolder: ${migrationFolder}`)
  return new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: os.platform() === "win32" ? migrationFolder.slice(1) : migrationFolder,
    }),
  })
}
