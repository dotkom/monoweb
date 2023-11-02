import { promises as fs } from "fs"
import * as path from "path"
import { FileMigrationProvider, type Kysely, Migrator } from "kysely"
import { type Database } from "./"

export const createMigrator = (db: Kysely<Database>) =>
  new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: new URL("migrations", import.meta.url).pathname,
    }),
  })
