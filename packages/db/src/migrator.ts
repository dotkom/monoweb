import fs from "fs/promises"
import path from "path"
import { FileMigrationProvider, type Kysely, Migrator } from "kysely"
import { type Database } from "./"

export const createMigrator = (db: Kysely<Database>, urlOverride?: URL) => {
  const url = urlOverride ?? new URL("migrations", import.meta.url)
  const folderPath = decodeURIComponent(url.pathname)

  // Uncomment this if it isn't working for windows. Windows paths might start with a slash that needs to be removed.
  //   if (process.platform === "win32") {
  //     folderPath = folderPath.replace(/^\/(\w:)/, '$1');
  //   }

  return new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: folderPath,
    }),
  })
}
