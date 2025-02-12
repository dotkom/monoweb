import type { S3Client } from "@aws-sdk/client-s3"
import { createPrisma, type DBClient, migrateTestDatabase } from "@dotkomonline/db"
import type { ManagementClient } from "auth0"
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest"
import { mockDeep } from "vitest-mock-extended"
import { type StripeAccount, createServiceLayer } from "./src"
import { PostgreSqlContainer } from "@testcontainers/postgresql"

const MIGRATION_TIMEOUT = 10_000

const POSTGRES_IMAGE = "postgres:15-alpine"
const DB_USERNAME = "owuser"
const DB_PASSWORD = "owpassword"
const DB_NAME = "test"

export async function createServiceLayerForTesting() {
  const s3Client = mockDeep<S3Client>()
  const managementClient = mockDeep<ManagementClient>()
  const stripeAccounts = mockDeep<Record<string, StripeAccount>>()

  return await createServiceLayer({
    db: dbClient,
    s3Client,
    managementClient,
    stripeAccounts,
    s3BucketName: crypto.randomUUID(),
  })
}

export async function getTestContainerDatabase() {
  const container = await new PostgreSqlContainer(POSTGRES_IMAGE)
    .withUsername(DB_USERNAME)
    .withPassword(DB_PASSWORD)
    .withDatabase(DB_NAME)
    .withReuse()
    .start()

  console.log(`Container started: ${container}`)

  return `postgresql://${DB_USERNAME}:${DB_PASSWORD}@${container.getHost()}:${container.getFirstMappedPort()}/${DB_NAME}` 
}

let dbClient: DBClient
export let core: Awaited<ReturnType<typeof createServiceLayerForTesting>>

beforeAll(async () => {
  const dbUrl = await getTestContainerDatabase();

  await migrateTestDatabase(dbUrl)

  dbClient = await createPrisma(dbUrl)
  core = await createServiceLayerForTesting()
}, MIGRATION_TIMEOUT)

afterAll(async () => {
  if (dbClient !== undefined) await dbClient.$disconnect()
})

beforeEach(async () => {
  console.log("before:", await core.jobListingService.getLocations())

  await dbClient.$queryRaw`BEGIN TRANSACTION;`
})

afterEach(async () => {
  await dbClient.$queryRaw`ROLLBACK;`

  console.log("after:", await core.jobListingService.getLocations())
})
