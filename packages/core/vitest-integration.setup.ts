import { Database, createKysely, createMigrator } from "@dotkomonline/db"
import { Environment, createEnvironment } from "@dotkomonline/env"
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql"
import { Kysely, sql } from "kysely"
import { beforeAll } from "vitest"

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

async function runMigrations(env: Environment, dbName: string) {
  const url = buildDbUrl(dbName)
  const db = createKysely({
    ...env,
    DATABASE_URL: url,
  })
  const migrator = createMigrator(db, new URL("node_modules/@dotkomonline/db/src/migrations", import.meta.url))
  await migrator.migrateToLatest().catch(console.warn)
  await db.destroy()
}

export function buildDbUrl(dbName: string): string {
  return `postgres://${testDBConfig.username}:${
    testDBConfig.password
  }@localhost:${container.getFirstMappedPort()}/${dbName}`
}

async function resetTestDatabase(env: Environment, dbName: string) {
  try {
    // Create client for the default database and use it to drop and recreate the test database
    const url = buildDbUrl("postgres")
    const db = createKysely({
      ...env,
      DATABASE_URL: url,
    })

    const deleteQuery = sql`drop database if exists ${sql.ref(dbName)}`.compile(db)
    const createQuery = sql`create database ${sql.ref(dbName)}`.compile(db)

    await db.executeQuery(deleteQuery)
    await db.executeQuery(createQuery)

    await db.destroy()
  } catch (e) {
    console.log("Error resetting database")
    console.error(e)
  }
}

export async function setupTestDB(env: Environment, dbName: string) {
  await resetTestDatabase(env, dbName)
  await runMigrations(env, dbName)
}

beforeAll(async () => {
  container = await setupDatabaseContainer()
}, 30000)

process.on("beforeExit", async () => {
  // await container.stop()
})
