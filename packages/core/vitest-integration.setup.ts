import { beforeEach } from "vitest"
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql"
import { createMigrator, createKysely } from "@dotkomonline/db"
import { createEnvironment } from "@dotkomonline/env"
import { type MigrationResultSet } from "kysely"

const containers: StartedPostgreSqlContainer[] = []
const handleResult = (result: MigrationResultSet) => {
  const executedMigrations = result.results ?? []
  for (const migration of executedMigrations) {
    console.info(`${migration.direction} - Migrated ${migration.migrationName} - ${migration.status}`)
  }
  if (result.error) {
    console.warn("Caught error during migration run:")
    console.warn(JSON.stringify(result.error, null, 2))
  }
}

beforeEach(async () => {
  const container = await new PostgreSqlContainer("public.ecr.aws/z5h0l8j6/dotkom/pgx-ulid:0.1.3")
    .withExposedPorts(5432)
    .withUsername("local")
    .withPassword("local")
    .withDatabase("main")
    .start()
  process.env.DATABASE_URL = container.getConnectionUri()
  const env = createEnvironment()
  const kysely = createKysely(env)
  const migrator = createMigrator(kysely)
  const result = await migrator.migrateToLatest()
  handleResult(result)
  containers.push(container)
})

process.on("exit", async () => {
  await Promise.all(containers.map((container) => container.stop()))
})
