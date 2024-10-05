import repl from "node:repl"
import { type ServiceLayerOptions, createServiceLayer } from "@dotkomonline/core"
import { createKysely } from "@dotkomonline/db"
import { env } from "./env"

const kysely = createKysely(env.DATABASE_URL)
// biome-ignore lint/suspicious/noExplicitAny: we don't provide s3 support for shell just yet
const s3Client = new Proxy<ServiceLayerOptions["s3Client"]>({} as any, {})
// biome-ignore lint/suspicious/noExplicitAny: we don't provide auth0 support for shell just yet
const auth0Client = new Proxy<ServiceLayerOptions["managementClient"]>({} as any, {})
// biome-ignore lint/suspicious/noExplicitAny: we don't provide stripe support for shell just yet
const stripeAccounts = new Proxy<ServiceLayerOptions["stripeAccounts"]>({} as any, {})
const s3BucketName = `shell-invalid-s3-bucket-${crypto.randomUUID()}`

const core = await createServiceLayer({
  db: kysely,
  s3Client,
  managementClient: auth0Client,
  s3BucketName,
  stripeAccounts,
})

console.warn("The monoweb shell does not support s3, auth0, or stripe operations at this time.")

// Start the REPL
const replServer = repl.start({
  prompt: "> ",
})

// Make services available in the REPL
replServer.context.core = core
