import type { S3Client } from "@aws-sdk/client-s3"
import type { DBClient } from "@dotkomonline/db"
import { getTestClient } from "@dotkomonline/db/src/testDatabases"
import type { ManagementClient } from "auth0"
import { afterAll, beforeEach } from "vitest"
import { mockDeep } from "vitest-mock-extended"
import { type StripeAccount, createServiceLayer } from "./src"

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

afterAll(async () => {
  if (dbClient !== undefined) await dbClient.$disconnect()
})

beforeEach(async () => {
  dbClient = await getTestClient()
  core = await createServiceLayerForTesting()
})
