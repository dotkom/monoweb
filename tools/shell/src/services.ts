import repl from "node:repl"
import { type ServiceLayerOptions, createServiceLayer } from "@dotkomonline/core"
import { createPrisma } from "@dotkomonline/db"
import { env } from "./env"

const prisma = createPrisma(env.DATABASE_URL)
// biome-ignore lint/suspicious/noExplicitAny: we don't provide s3 support for shell just yet
const s3Client = new Proxy<ServiceLayerOptions["s3Client"]>({} as any, {})
// biome-ignore lint/suspicious/noExplicitAny: we don't provide auth0 support for shell just yet
const auth0Client = new Proxy<ServiceLayerOptions["managementClient"]>({} as any, {})
// biome-ignore lint/suspicious/noExplicitAny: we don't provide stripe support for shell just yet
const stripeAccounts = new Proxy<ServiceLayerOptions["stripeAccounts"]>({} as any, {})
const s3BucketName = `shell-invalid-s3-bucket-${crypto.randomUUID()}`

const core = await createServiceLayer({
  db: prisma,
  s3Client,
  managementClient: auth0Client,
  s3BucketName,
  stripeAccounts,
})

export {core, prisma}