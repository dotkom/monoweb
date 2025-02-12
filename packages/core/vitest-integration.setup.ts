import type { S3Client } from "@aws-sdk/client-s3"
import { type DBClient, getTestContainerDatabase } from "@dotkomonline/db"
import type { ManagementClient } from "auth0"
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest"
import { mockDeep } from "vitest-mock-extended"
import { type StripeAccount, createServiceLayer } from "./src"

const MIGRATION_TIMEOUT = 10_000

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

let dbClient: DBClient
export let core: Awaited<ReturnType<typeof createServiceLayerForTesting>>

beforeAll(async () => {
  dbClient = await getTestContainerDatabase()
  core = await createServiceLayerForTesting()
}, MIGRATION_TIMEOUT)

afterAll(async () => {
  if (dbClient !== undefined) await dbClient.$disconnect()
})

beforeEach(async () => {
  console.log("Starting transaction for test")
  dbClient.$queryRaw`BEGIN TRANSACTION`
})

afterEach(async () => {
  console.log("Rolling back transaction for test")
  dbClient.$queryRaw`ROLLBACK`
})
