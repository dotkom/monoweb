import { beforeEach, beforeAll, afterEach } from "vitest"
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql"
import { createMigrator, createKysely, Database } from "@dotkomonline/db"
import { Environment, createEnvironment } from "@dotkomonline/env"
import { sql } from "kysely"

// Configuration settings for the database container
const testDBConfig = {
  password: "local",
  username: "local",
  database: "main",
  imageName: "public.ecr.aws/z5h0l8j6/dotkom/pgx-ulid:0.1.3",
}

// Used globally for all tests
let container: StartedPostgreSqlContainer

async function setupDatabaseContainer() {
  const container = await new PostgreSqlContainer(testDBConfig.imageName)
    .withExposedPorts(5432)
    .withUsername(testDBConfig.username)
    .withPassword(testDBConfig.password)
    .withDatabase(testDBConfig.database)
    .withReuse()
    .start()

  process.env.DATABASE_URL = container.getConnectionUri()
  return container
}

async function runMigrations(env: Environment) {
  const kysely = createKysely(env)
  const migrator = createMigrator(kysely, new URL("node_modules/@dotkomonline/db/src/migrations", import.meta.url))
  await migrator.migrateToLatest().catch(console.warn)
  await kysely.destroy()
}

async function resetTestDatabase(container: StartedPostgreSqlContainer, env: Environment) {
  try {
    // Create client for the default database and use it to drop and recreate the test database
    const dbString = container.getConnectionUri().replace("/main", "/postgres")
    const kysely = createKysely({
      ...env,
      DATABASE_URL: dbString,
    })

    const deleteQuery = sql`drop database if exists ${sql.ref(testDBConfig.database)}`.compile(kysely)
    const createQuery = sql`create database ${sql.ref(testDBConfig.database)}`.compile(kysely)

    await kysely.executeQuery(deleteQuery)
    await kysely.executeQuery(createQuery)

    await kysely.destroy()
  } catch (e) {
    console.error(e)
  }
}

beforeAll(async () => {
  console.log("Starting database container")
  container = await setupDatabaseContainer()
}, 30000)

beforeEach(async () => {
  const env = createEnvironment()
  await runMigrations(env)
})

afterEach(async () => {
  const env = createEnvironment()
  await resetTestDatabase(container, env)
})

process.on("beforeExit", async () => {
  // await container.stop()
})
