import type { S3Client } from "@aws-sdk/client-s3"
import type { DBClient } from "@dotkomonline/db"
import { getPrismaClientForTest } from "@dotkomonline/db/test-harness"
import { faker } from "@faker-js/faker"
import type { ManagementClient } from "auth0"
import { afterAll, beforeEach } from "vitest"
import { mockDeep } from "vitest-mock-extended"
import { type StripeAccount, createServiceLayer } from "./src/modules/core"

faker.seed(69)

export async function createServiceLayerForTesting() {
  const s3Client = mockDeep<S3Client>()
  const auth0Client = mockDeep<ManagementClient>()
  const stripeAccounts = mockDeep<Record<"trikom" | "fagkom", StripeAccount>>()

  return await createServiceLayer(
    {
      prisma: dbClient,
      s3Client,
      auth0Client,
      stripeAccounts,
      // We are not testing the S3 functionality here, so we can use a non-existing bucket name.
    },
    "test-bucket-non-existing"
  )
}

export let dbClient: DBClient
export let core: Awaited<ReturnType<typeof createServiceLayerForTesting>>

afterAll(async () => {
  if (dbClient !== undefined) await dbClient.$disconnect()
})

beforeEach(async () => {
  dbClient = await getPrismaClientForTest()
  core = await createServiceLayerForTesting()
})
