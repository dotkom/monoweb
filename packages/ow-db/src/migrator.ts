import { promises as fs } from "fs"
import { FileMigrationProvider, Kysely, Migrator, PostgresAdapter, PostgresDialect } from "kysely"
import * as path from "path"

import { Database } from "./types"

export class CockroachAdapter extends PostgresAdapter {
  override acquireMigrationLock(): Promise<void> {
    return Promise.resolve()
  }
}

export class CockroachDialect extends PostgresDialect {
  override createAdapter(): CockroachAdapter {
    return new CockroachAdapter()
  }
}

export const createMigrator = (db: Kysely<Database>) =>
  new Migrator({
    db: db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: new URL("../src/migrations", import.meta.url).pathname,
    }),
  })
