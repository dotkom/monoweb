import { beforeEach } from "vitest"
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql"
import { createMigrator, createKysely } from "@dotkomonline/db"
import { createEnvironment } from "@dotkomonline/env"

const containers: StartedPostgreSqlContainer[] = []

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
  const migrator = createMigrator(kysely, new URL("node_modules/@dotkomonline/db/src/migrations", import.meta.url))
  const result = await migrator.migrateToLatest()
  if (result.error) {
    console.warn(`Error running migrations in test: ${result.error}`)
  }
  containers.push(container)
})

process.on("beforeExit", async () => {
  await Promise.all(containers.map(async (container) => container.stop()))
})
