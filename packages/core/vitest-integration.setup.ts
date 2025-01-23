import type { S3Client } from "@aws-sdk/client-s3"
import { type Database, createKysely, createMigrator } from "@dotkomonline/db"
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql"
import type { ManagementClient } from "auth0"
import { type Kysely, sql } from "kysely"
import { afterAll, beforeAll } from "vitest"
import { mockDeep } from "vitest-mock-extended"
import { createServiceLayer } from "./src"
import type { StripeAccount } from "./src/modules/payment/payment-service"

let container: StartedPostgreSqlContainer
let host: Kysely<Database>

async function runMigrations(dbName: string) {
  const db = createKyselyForDatabase(dbName)
  const migrator = createMigrator(db, new URL("node_modules/@dotkomonline/db/src/migrations", import.meta.url))
  await migrator.migrateToLatest().catch(console.warn)
  await db.destroy()
}

function createKyselyForDatabase(dbName: string): Kysely<Database> {
  return createKysely(`postres://local:local@${container.getHost()}:${container.getFirstMappedPort()}/${dbName}`)
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

export async function createServiceLayerForTesting(database: string) {
  await createTestDatabase(database)
  await runMigrations(database)
  const kysely = createKyselyForDatabase(database)

  const s3Client = mockDeep<S3Client>()
  const auth0Client = mockDeep<ManagementClient>()
  const stripeAccounts = mockDeep<Record<string, StripeAccount>>()
  const s3BucketName = crypto.randomUUID()
  const core = await createServiceLayer({
    db: kysely,
    s3Client,
    managementClient: auth0Client,
    stripeAccounts,
    s3BucketName,
  })

  return {
    core,
    kysely,
    s3Client,
    auth0Client,
    stripeAccounts,
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

  host = createKysely(container.getConnectionUri())
}, 30000)

afterAll(async () => {
  await host.destroy()
})

process.on("beforeExit", async () => {
  // await container.stop()
})
