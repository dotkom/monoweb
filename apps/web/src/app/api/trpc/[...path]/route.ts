import { env } from "@/env"
import { createProxyRoute } from "@dotkomonline/proxy-nextjs"

const handler = createProxyRoute({
  mountPath: "/api/trpc",
  apiEndpoint: env.RPC_HOST,
  secret: env.AUTH_SECRET,
})

export const GET = handler
export const POST = handler
