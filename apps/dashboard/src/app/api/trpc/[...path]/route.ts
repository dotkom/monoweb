import { createProxyRoute } from "@dotkomonline/proxy-nextjs"
import { env } from "../../../../env"

const handler = createProxyRoute({
  mountPath: "/api/trpc",
  apiEndpoint: env.RPC_HOST,
  secret: env.AUTH_SECRET,
})

export const GET = handler
export const POST = handler
