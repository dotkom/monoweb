import type { S3Client } from "@aws-sdk/client-s3"
import type { SESClient } from "@aws-sdk/client-ses"
import type { DBClient } from "@dotkomonline/db"
import { getPrismaClientForTest } from "@dotkomonline/db/test-harness"
import { faker } from "@faker-js/faker"
import type { ManagementClient } from "auth0"
import type Stripe from "stripe"
import { afterAll, beforeEach } from "vitest"
import { type DeepMockProxy, mockDeep } from "vitest-mock-extended"
import type { Configuration } from "./src/configuration"
import { createServiceLayer } from "./src/modules/core"

faker.seed(69)

async function createServiceLayerForTesting() {
  s3Client = mockDeep<S3Client>()
  sesClient = mockDeep<SESClient>()
  auth0Client = mockDeep<ManagementClient>()
  stripe = mockDeep<Stripe>()
  configuration = mockDeep<Configuration>({
    AWS_S3_BUCKET: "no.online.ntnu.mock-bucket",
    AWS_REGION: "eu-north-1",
    ALLOWED_ORIGINS: "",
  })

  return await createServiceLayer(
    {
      prisma: dbClient,
      s3Client,
      sesClient,
      auth0Client,
      stripe,
      workspaceDirectory: null,
    },
    configuration
  )
}

export let configuration: DeepMockProxy<Configuration>
export let stripe: DeepMockProxy<Stripe>
export let s3Client: DeepMockProxy<S3Client>
export let sesClient: DeepMockProxy<SESClient>
export let auth0Client: DeepMockProxy<ManagementClient>
export let dbClient: DBClient
export let core: Awaited<ReturnType<typeof createServiceLayerForTesting>>

afterAll(async () => {
  if (dbClient !== undefined) await dbClient.$disconnect()
})

beforeEach(async () => {
  dbClient = await getPrismaClientForTest()
  core = await createServiceLayerForTesting()
})
