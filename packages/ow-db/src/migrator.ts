import { promises as fs } from "fs"
import { FileMigrationProvider, Kysely, Migrator } from "kysely"
import * as path from "path"

import { Database } from "./types"

export const createMigrator = (db: Kysely<Database>) =>
  new Migrator({
    db: db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: new URL("migrations", import.meta.url).pathname,
    }),
  })
