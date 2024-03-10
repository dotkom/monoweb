import { Database, createKysely, createMigrator } from "@dotkomonline/db"
import { createEnvironment, Environment } from "@dotkomonline/env"
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql"
import { Kysely, sql } from "kysely"
import { beforeAll, afterAll } from "vitest"

let container: StartedPostgreSqlContainer
let host: Kysely<Database>

async function runMigrations(env: Environment, dbName: string) {
  const db = createKyselyForDatabase(env, dbName)
  const migrator = createMigrator(db, new URL("node_modules/@dotkomonline/db/src/migrations", import.meta.url))
  await migrator.migrateToLatest().catch(console.warn)
  await db.destroy()
}

function createKyselyForDatabase(env: Environment, dbName: string): Kysely<Database> {
  return createKysely({
    ...env,
    DATABASE_URL: `postres://local:local@${container.getHost()}:${container.getFirstMappedPort()}/${dbName}`,
  })
}

async function createTestDatabase(dbName: string) {
  try {
    await host.executeQuery(sql`drop database if exists ${sql.ref(dbName)}`.compile(host))
    await host.executeQuery(sql`create database ${sql.ref(dbName)}`.compile(host))
  } catch (e) {
    console.error("Error resetting database")
    console.error(e)
  }
}

export type CleanupFunction = () => Promise<void>

export async function createServiceLayerForTesting(env: Environment, database: string) {
  await createTestDatabase(database)
  await runMigrations(env, database)
  const kysely = createKyselyForDatabase(env, database)

  return {
    kysely,
    cleanup: async () => {
      await kysely.destroy()
    },
  }
}

beforeAll(async () => {
  container = await new PostgreSqlContainer("public.ecr.aws/z5h0l8j6/dotkom/pgx-ulid:0.1.3")
    .withExposedPorts(5432)
    .withUsername("local")
    .withPassword("local")
    .withDatabase("main")
    .withReuse()
    .start()

  process.env.DATABASE_URL = container.getConnectionUri()
  host = createKysely(createEnvironment())
}, 30000)

afterAll(async () => {
  await host.destroy()
})

process.on("beforeExit", async () => {
  // await container.stop()
})
